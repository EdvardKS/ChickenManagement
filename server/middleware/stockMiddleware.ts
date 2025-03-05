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

    console.log('Processing stock update:', stockUpdate);

    const currentStock = await storage.getCurrentStock();
    if (!currentStock) throw new Error('No stock found');

    const newStock: Partial<Stock> = {
      currentStock: stockUpdate.currentStock.toFixed(1),
      reservedStock: stockUpdate.reservedStock.toFixed(1),
      unreservedStock: stockUpdate.unreservedStock.toFixed(1),
      lastUpdated: new Date()
    };

    // Solo actualizar initial_stock si la acción está relacionada con stock montado
    if (stockUpdate.action === 'add_mounted' || stockUpdate.action === 'remove_mounted') {
      newStock.initialStock = stockUpdate.initialStock.toFixed(1);
      // Para actualizaciones de stock montado, no modificamos current_stock
      delete newStock.currentStock;
      delete newStock.reservedStock;
      delete newStock.unreservedStock;
    }

    console.log('Updating stock with:', newStock);

    const updatedStock = await storage.updateStock({
      ...newStock,
      updateType: stockUpdate.action
    });
    console.log('Stock updated:', updatedStock);

    // Crear entrada en el historial
    const historyEntry: Partial<StockHistory> = {
      stockId: updatedStock.id,
      action: stockUpdate.action,
      quantity: stockUpdate.quantity.toFixed(1),
      previousStock: currentStock.initialStock,
      newStock: updatedStock.initialStock,
      createdBy: stockUpdate.source || 'system'
    };

    await storage.createStockHistory(historyEntry);
    next();
  } catch (error) {
    console.error('Error in stock middleware:', error);
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

  // Convertir todos los valores a números
  const initial = parseFloat(currentStock.initialStock);
  const current = parseFloat(currentStock.currentStock);
  const reserved = parseFloat(currentStock.reservedStock);

  let newInitial = initial;
  let newCurrent = current;
  let newReserved = reserved;

  console.log('Current values before update:', {
    initial,
    current,
    reserved,
    action,
    quantity
  });

  switch (action) {
    case 'add_mounted':
      // Aumenta solo el stock montado
      newInitial = initial + quantity;
      break;
    case 'remove_mounted':
      // Reduce solo el stock montado
      newInitial = Math.max(0, initial - quantity);
      break;
    case 'direct_sale':
      // Solo reduce el stock actual
      newCurrent = Math.max(0, current - quantity);
      break;
    case 'direct_sale_correction':
      // Solo aumenta el stock actual
      newCurrent = current + quantity;
      break;
    case 'new_order':
      // Aumenta solo el stock reservado
      newReserved = reserved + quantity;
      break;
    case 'cancel_order':
      // Reduce solo el stock reservado
      newReserved = Math.max(0, reserved - quantity);
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

  console.log('Prepared stock update:', update);
  return update;
}