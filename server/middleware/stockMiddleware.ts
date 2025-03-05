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

    let newStock: Partial<Stock> = {
      lastUpdated: new Date()
    };

    // Para actualizaciones de stock montado
    if (stockUpdate.action === 'add_mounted' || stockUpdate.action === 'remove_mounted') {
      newStock.initialStock = stockUpdate.initialStock.toFixed(1);
      newStock.currentStock = stockUpdate.initialStock.toFixed(1);
    } 
    // Para ventas directas y correcciones
    else if (stockUpdate.action === 'direct_sale' || stockUpdate.action === 'direct_sale_correction') {
      newStock.currentStock = stockUpdate.currentStock.toFixed(1);
      // Mantener el initial_stock sin cambios
      newStock.initialStock = currentStock.initialStock;
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
      previousStock: stockUpdate.action.includes('mounted') ? currentStock.initialStock : currentStock.currentStock,
      newStock: stockUpdate.action.includes('mounted') ? updatedStock.initialStock : updatedStock.currentStock,
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
      newInitial = initial + quantity;
      newCurrent = newInitial;
      break;
    case 'remove_mounted':
      newInitial = Math.max(0, initial - quantity);
      newCurrent = newInitial;
      break;
    case 'direct_sale':
      newCurrent = Math.max(0, current - quantity);
      break;
    case 'direct_sale_correction':
      newCurrent = current + quantity;
      break;
    case 'new_order':
      newReserved = reserved + quantity;
      break;
    case 'cancel_order':
      newReserved = Math.max(0, reserved - quantity);
      break;
    case 'reset_stock':
      newInitial = 0;
      newCurrent = 0;
      newReserved = 0;
      break;
  }

  console.log('Prepared stock update:', {
    initialStock: newInitial,
    currentStock: newCurrent,
    reservedStock: newReserved,
    unreservedStock: Math.max(0, newCurrent - newReserved),
    action,
    quantity,
    source
  });

  return {
    initialStock: newInitial,
    currentStock: newCurrent,
    reservedStock: newReserved,
    unreservedStock: Math.max(0, newCurrent - newReserved),
    action,
    quantity,
    source
  };
}