import { type Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { type Stock, type StockHistory } from '@shared/schema';

type StockAction = 
  | 'add_mounted'  // Para modificar stock montado (initial_stock)
  | 'remove_mounted'
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
  quantity: number;
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
  quantity: number,
  source?: 'admin' | 'client'
): Promise<StockUpdate> {
  const currentStock = await storage.getCurrentStock();
  if (!currentStock) throw new Error('No stock found');

  console.log('[Prepare Stock Update] Estado actual:', {
    current: currentStock,
    action,
    quantity
  });

  // Convertir todos los valores a números
  const initial = parseFloat(currentStock.initialStock);
  const current = parseFloat(currentStock.currentStock);
  const reserved = parseFloat(currentStock.reservedStock);

  let newInitial = initial;
  let newCurrent = current;
  let newReserved = reserved;

  switch (action) {
    case 'direct_sale':
      // Solo reduce el stock actual
      newCurrent = Math.max(0, current - quantity);
      console.log('[Prepare Stock Update] Venta directa:', {
        oldCurrent: current,
        quantity,
        newCurrent
      });
      break;
    case 'direct_sale_correction':
      // Solo aumenta el stock actual
      newCurrent = current + quantity;
      console.log('[Prepare Stock Update] Corrección de venta:', {
        oldCurrent: current,
        quantity,
        newCurrent
      });
      break;
    case 'add_mounted':
      newInitial = initial + quantity;
      newCurrent = newInitial;
      break;
    case 'remove_mounted':
      newInitial = Math.max(0, initial - quantity);
      newCurrent = newInitial;
      break;
    case 'new_order':
      newReserved = reserved + quantity;
      break;
    case 'cancel_order':
      newReserved = Math.max(0, reserved - quantity);
      break;
    case 'order_delivered':
      newCurrent = Math.max(0, current - quantity);
      newReserved = Math.max(0, reserved - quantity);
      break;
    case 'order_error':
      newReserved = Math.max(0, reserved - quantity);
      break;
    case 'order_update':
      // quantity aquí representa la diferencia (nuevo - antiguo)
      newReserved = Math.max(0, reserved + quantity);
      break;
    case 'reset_stock':
      newInitial = 0;
      newCurrent = 0;
      newReserved = 0;
      break;
  }

  const update = {
    initialStock: newInitial,
    currentStock: newCurrent,
    reservedStock: newReserved,
    unreservedStock: Math.max(0, newCurrent - newReserved),
    action,
    quantity,
    source
  };

  console.log('[Prepare Stock Update] Actualización preparada:', update);
  return update;
}