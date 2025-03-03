import { type Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { type Stock, type StockHistory } from '@shared/schema';

type StockAction = 
  | 'order_cancelled'
  | 'order_error'
  | 'order_delivered'
  | 'direct_sale'
  | 'direct_sale_correction'
  | 'new_order'
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

    // Asegurar que todos los valores sean números antes de la conversión a string
    const newStock: Partial<Stock> = {
      initialStock: String(Math.max(0, stockUpdate.initialStock)),
      currentStock: String(Math.max(0, stockUpdate.currentStock)),
      reservedStock: String(Math.max(0, stockUpdate.reservedStock)),
      unreservedStock: String(Math.max(0, stockUpdate.unreservedStock)),
      lastUpdated: new Date()
    };

    console.log('Updating stock with:', newStock);

    // Actualizar stock
    const updatedStock = await storage.updateStock(newStock);
    console.log('Stock updated:', updatedStock);

    // Crear entrada en el historial
    const historyEntry: Partial<StockHistory> = {
      stockId: updatedStock.id,
      action: stockUpdate.action,
      quantity: stockUpdate.quantity,
      previousStock: parseFloat(currentStock.currentStock),
      newStock: parseFloat(updatedStock.currentStock),
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
    case 'order_cancelled':
    case 'order_error':
      // Solo afecta al stock reservado
      newReserved = Math.max(0, reserved - quantity);
      break;
    case 'order_delivered':
      // Reduce stock total y reservado
      newCurrent = Math.max(0, current - quantity);
      newReserved = Math.max(0, reserved - quantity);
      break;
    case 'direct_sale':
      // Reduce stock total
      newCurrent = Math.max(0, current - quantity);
      break;
    case 'direct_sale_correction':
      // Aumenta stock total y si es la primera venta del día, también el inicial
      newCurrent = current + quantity;
      if (current === 0 && initial === 0) {
        newInitial = quantity;
      }
      break;
    case 'new_order':
      // Aumenta stock reservado
      newReserved = reserved + quantity;
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