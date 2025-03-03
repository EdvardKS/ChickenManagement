import { type Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { type Stock, type StockHistory } from '@shared/schema';

// Tipos de acciones que afectan al stock
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
  const stockUpdate = req.stockUpdate;
  if (!stockUpdate) return next();

  try {
    const currentStock = await storage.getCurrentStock();
    if (!currentStock) throw new Error('No stock found');

    // Update stock values
    const newStock: Partial<Stock> = {
      initialStock: stockUpdate.initialStock.toString(),
      currentStock: stockUpdate.currentStock.toString(),
      reservedStock: stockUpdate.reservedStock.toString(),
      unreservedStock: stockUpdate.unreservedStock.toString(),
      lastUpdated: new Date()
    };

    // Update stock
    const updatedStock = await storage.updateStock(newStock);

    // Create stock history entry
    const historyEntry: Partial<StockHistory> = {
      stockId: updatedStock.id,
      action: stockUpdate.action,
      quantity: stockUpdate.quantity,
      previousStock: parseFloat(currentStock.currentStock.toString()),
      newStock: stockUpdate.currentStock,
      createdBy: stockUpdate.source || 'system'
    };

    await storage.createStockHistory(historyEntry);

    next();
  } catch (error) {
    console.error('Error in stock middleware:', error);
    next(error);
  }
}

// Helper function to prepare stock update data
export async function prepareStockUpdate(
  action: StockAction,
  quantity: number,
  source?: 'admin' | 'client'
): Promise<StockUpdate> {
  const currentStock = await storage.getCurrentStock();
  if (!currentStock) throw new Error('No stock found');

  const initial = parseFloat(currentStock.initialStock.toString());
  const current = parseFloat(currentStock.currentStock.toString());
  const reserved = parseFloat(currentStock.reservedStock.toString());

  let newInitial = initial;
  let newCurrent = current;
  let newReserved = reserved;

  switch (action) {
    case 'order_cancelled':
      // Solo afecta al stock reservado
      newReserved = reserved - quantity;
      break;
    case 'order_error':
      // Solo afecta al stock reservado
      newReserved = reserved - quantity;
      break;
    case 'order_delivered':
      // Reduce stock total y reservado
      newCurrent = current - quantity;
      newReserved = reserved - quantity;
      break;
    case 'direct_sale':
      // Reduce stock total
      newCurrent = current - quantity;
      break;
    case 'direct_sale_correction':
      // Aumenta stock total
      newCurrent = current + quantity;
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

  return {
    initialStock: newInitial,
    currentStock: newCurrent,
    reservedStock: newReserved,
    unreservedStock: newCurrent - newReserved,
    action,
    quantity,
    source
  };
}