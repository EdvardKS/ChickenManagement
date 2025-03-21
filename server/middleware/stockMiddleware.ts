import { type Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { type Stock, type StockHistory } from '@shared/schema';

type StockAction = 
  | 'add_mounted'  // Para modificar stock montado (initial_stock)
  | 'remove_mounted'
  | 'mounted_correction' // Para correcciones de stock montado
  | 'direct_sale'  // Para ventas sin encargo (current_stock)
  | 'direct_sale_correction'
  | 'new_order'    // Para pedidos (reserved_stock)
  | 'cancel_order'
  | 'order_delivered'
  | 'order_error'
  | 'order_update'
  | 'reset_stock';

interface StockUpdate {
  initialStock: number;
  currentStock: number;
  reservedStock: number;
  unreservedStock: number;
  action: StockAction;
  quantity: number;  // Siempre esperamos un número
  source?: 'admin' | 'client';
}

export async function stockMiddleware(
  req: Request & { stockUpdate?: StockUpdate },
  _res: Response,
  next: NextFunction
) {
  try {
    const stockUpdate = req.stockUpdate;
    if (!stockUpdate) return next();

    console.log('[Stock Middleware] Procesando actualización:', stockUpdate);

    const currentStock = await storage.getCurrentStock();
    if (!currentStock) throw new Error('No stock found');

    // Extraer solo los campos permitidos para la actualización del stock
    const { initialStock, currentStock: newCurrentStock, reservedStock, unreservedStock } = stockUpdate;

    const newStock: Partial<Stock> = {
      initialStock: initialStock.toString(),
      currentStock: newCurrentStock.toString(),
      reservedStock: reservedStock.toString(),
      unreservedStock: unreservedStock.toString(),
      lastUpdated: new Date()
    };

    console.log('[Stock Middleware] Actualizando stock con:', newStock);

    const updatedStock = await storage.updateStock(newStock);

    console.log('[Stock Middleware] Stock actualizado:', updatedStock);

    // Crear entrada en el historial
    await storage.createStockHistory({
      id: 0, // La base de datos generará el ID real
      stockId: updatedStock.id,
      action: stockUpdate.action,
      quantity: stockUpdate.quantity.toString(),
      previousStock: currentStock.currentStock,
      newStock: updatedStock.currentStock,
      createdBy: stockUpdate.source || 'system',
      createdAt: new Date()
    });

    next();
  } catch (error) {
    console.error('[Stock Middleware] Error:', error);
    next(error);
  }
}

export async function prepareStockUpdate(
  action: StockAction,
  quantity: number | string,
  source?: 'admin' | 'client',
  isPastOrder: boolean = false
): Promise<StockUpdate> {
  const currentStock = await storage.getCurrentStock();
  if (!currentStock) throw new Error('No stock found');

  // Asegurar que quantity es un número
  const quantityNum = typeof quantity === 'string' ? parseFloat(quantity) : Number(quantity);
  
  if (isNaN(quantityNum)) {
    throw new Error(`Cantidad inválida: ${quantity}. Se espera un número válido.`);
  }

  console.log('[Prepare Stock Update] Estado actual:', {
    current: currentStock,
    action,
    quantity: quantityNum,
    quantityOriginal: quantity,
    isPastOrder
  });

  // Si es un pedido de días pasados, permitimos operaciones especiales
  if (isPastOrder) {
    console.log('[Prepare Stock Update] Procesando pedido de día pasado');
    // Para pedidos pasados, no afectamos el stock actual
    return {
      initialStock: parseFloat(currentStock.initialStock),
      currentStock: parseFloat(currentStock.currentStock),
      reservedStock: parseFloat(currentStock.reservedStock),
      unreservedStock: parseFloat(currentStock.unreservedStock),
      action,
      quantity: quantityNum,  // Usar el valor numérico convertido
      source
    };
  }

  // Convertir todos los valores a números, asegurándonos de que sean valores válidos
  const initial = parseFloat(currentStock.initialStock);
  const current = parseFloat(currentStock.currentStock);
  const reserved = parseFloat(currentStock.reservedStock);
  
  // Verificar que los valores convertidos son válidos
  if (isNaN(initial) || isNaN(current) || isNaN(reserved)) {
    throw new Error(`Valores de stock inválidos: initialStock=${currentStock.initialStock}, currentStock=${currentStock.currentStock}, reservedStock=${currentStock.reservedStock}`);
  }

  let newInitial = initial;
  let newCurrent = current;
  let newReserved = reserved;

  switch (action) {
    case 'direct_sale':
      // Solo reduce el stock actual para ventas sin encargo
      newCurrent = Math.max(0, current - quantityNum);
      console.log('[Prepare Stock Update] Venta directa:', {
        oldCurrent: current,
        quantity: quantityNum,
        newCurrent
      });
      break;
    case 'direct_sale_correction':
      // Solo aumenta el stock actual (corrección)
      newCurrent = current + quantityNum;
      console.log('[Prepare Stock Update] Corrección de venta:', {
        oldCurrent: current,
        quantity: quantityNum,
        newCurrent
      });
      break;
    case 'add_mounted':
      // Actualiza initial_stock (pollos montados) y current_stock
      newInitial = initial + quantityNum;
      newCurrent = current + quantityNum; // También incrementamos current_stock
      console.log('[Prepare Stock Update] Pollos montados añadidos:', {
        oldInitial: initial,
        oldCurrent: current,
        quantity: quantityNum,
        newInitial,
        newCurrent
      });
      break;
    case 'remove_mounted':
      // Actualiza initial_stock (corrección de pollos montados) y current_stock
      newInitial = Math.max(0, initial - quantityNum);
      newCurrent = Math.max(0, current - quantityNum); // También decrementamos current_stock
      console.log('[Prepare Stock Update] Corrección de pollos montados:', {
        oldInitial: initial,
        oldCurrent: current,
        quantity: quantityNum,
        newInitial,
        newCurrent
      });
      break;
    case 'new_order':
      // Solo aumenta el stock reservado (pedidos)
      newReserved = reserved + quantityNum;
      console.log('[Prepare Stock Update] Nuevo pedido:', {
        oldReserved: reserved,
        quantity: quantityNum,
        newReserved
      });
      break;
    case 'cancel_order':
      // Solo reduce el stock reservado (cancelación de pedidos)
      newReserved = Math.max(0, reserved - quantityNum);
      console.log('[Prepare Stock Update] Pedido cancelado:', {
        oldReserved: reserved,
        quantity: quantityNum,
        newReserved
      });
      break;
    case 'order_delivered':
      // Reduce el stock actual y reservado (entrega de pedidos)
      newCurrent = Math.max(0, current - quantityNum);
      newReserved = Math.max(0, reserved - quantityNum);
      console.log('[Prepare Stock Update] Pedido entregado:', {
        oldCurrent: current,
        oldReserved: reserved,
        quantity: quantityNum,
        newCurrent,
        newReserved
      });
      break;
    case 'order_error':
      // Solo reduce el stock reservado (pedido con error)
      newReserved = Math.max(0, reserved - quantityNum);
      console.log('[Prepare Stock Update] Pedido con error:', {
        oldReserved: reserved,
        quantity: quantityNum,
        newReserved
      });
      break;
    case 'order_update':
      // Actualiza el stock reservado (modificación de pedido)
      // quantity aquí representa la diferencia (nuevo - antiguo)
      newReserved = Math.max(0, reserved + quantityNum);
      console.log('[Prepare Stock Update] Pedido actualizado:', {
        oldReserved: reserved,
        quantity: quantityNum,
        newReserved
      });
      break;
    case 'reset_stock':
      // Resetea todos los valores a 0
      newInitial = 0;
      newCurrent = 0;
      newReserved = 0;
      console.log('[Prepare Stock Update] Reseteando stock:', {
        oldInitial: initial,
        oldCurrent: current,
        oldReserved: reserved,
        newInitial,
        newCurrent,
        newReserved
      });
      break;
  }

  // Crear el objeto de actualización usando el valor numérico convertido para quantity
  const update: StockUpdate = {
    initialStock: newInitial,
    currentStock: newCurrent,
    reservedStock: newReserved,
    unreservedStock: Math.max(0, newCurrent - newReserved),
    action,
    quantity: quantityNum,  // Usar el valor numérico convertido
    source
  };

  console.log('[Prepare Stock Update] Actualización preparada:', update);
  return update;
}