import { type Request, type Response, type NextFunction } from "express";
import { storage } from "../storage";
import { type Stock, type StockHistory } from "@shared/schema";

interface StockUpdateOptions {
  action: 'add' | 'subtract' | 'cancel' | 'error' | 'complete' | 'reset';
  quantity: number;
  source: 'admin' | 'client' | 'system';
  orderId?: number;
}

export async function handleStockUpdate(req: Request, res: Response, next: NextFunction) {
  const stockUpdateData = res.locals.stockUpdate as StockUpdateOptions;
  
  if (!stockUpdateData) {
    return next();
  }

  try {
    const currentStock = await storage.getCurrentStock();
    const { action, quantity, source, orderId } = stockUpdateData;

    // Get current orders to calculate reserved stock
    const orders = await storage.getOrders();
    const reservedStock = orders
      .filter(order => order.status === "pending" && !order.deleted)
      .reduce((total, order) => total + parseFloat(order.quantity.toString()), 0);

    let newStock: Partial<Stock> = {};
    let historyAction: string = action;

    switch (action) {
      case 'add':
        newStock = {
          currentStock: parseFloat(currentStock?.currentStock?.toString() || "0") + quantity,
          initialStock: currentStock?.initialStock || quantity.toString(),
        };
        break;
      
      case 'subtract':
        newStock = {
          currentStock: parseFloat(currentStock?.currentStock?.toString() || "0") - quantity,
        };
        break;
      
      case 'complete':
        newStock = {
          currentStock: parseFloat(currentStock?.currentStock?.toString() || "0") - quantity,
        };
        historyAction = 'order_completed';
        break;
      
      case 'cancel':
        // Only update logs, no stock change
        historyAction = 'order_cancelled';
        break;
      
      case 'error':
        // Only update logs, no stock change
        historyAction = 'order_error';
        break;
      
      case 'reset':
        newStock = {
          currentStock: 0,
          initialStock: "0",
          date: new Date()
        };
        historyAction = 'day_reset';
        break;
    }

    if (Object.keys(newStock).length > 0) {
      const updatedStock = await storage.updateStock({
        ...currentStock,
        ...newStock,
        reservedStock: reservedStock.toString(),
        unreservedStock: (parseFloat(newStock.currentStock?.toString() || "0") - reservedStock).toString()
      });

      // Create stock history entry
      const historyEntry: Partial<StockHistory> = {
        stockId: updatedStock.id,
        action: historyAction,
        quantity: quantity.toString(),
        previousStock: currentStock?.currentStock?.toString() || "0",
        newStock: updatedStock.currentStock.toString(),
        createdBy: source,
        orderId: orderId
      };

      await storage.createStockHistory(historyEntry);
    }

    next();
  } catch (error) {
    console.error('Error in stock middleware:', error);
    res.status(500).json({ error: 'Error al actualizar el stock' });
  }
}
