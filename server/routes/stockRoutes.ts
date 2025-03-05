import { Router } from 'express';
import { type Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { stockMiddleware, prepareStockUpdate } from '../middleware/stockMiddleware';

const router = Router();

// Schema para validar cantidad
const stockUpdateSchema = z.object({
  amount: z.string()
});

// Get current stock status
router.get("/", async (_req, res) => {
  try {
    const stock = await storage.getCurrentStock();
    const orders = await storage.getOrders();

    // Calcular stock reservado para hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reservedStock = orders
      .filter(order => {
        const orderDate = new Date(order.pickupTime);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime() &&
               order.status === "pending" &&
               !order.deleted;
      })
      .reduce((total, order) => total + parseFloat(order.quantity.toString()), 0);

    const currentStock = parseFloat(stock?.currentStock || "0");

    const response = {
      ...stock,
      reservedStock: reservedStock.toString(),
      unreservedStock: (currentStock - reservedStock).toString()
    };

    res.json(response);
  } catch (error) {
    console.error('Error getting stock:', error);
    res.status(500).json({ error: 'Error al obtener el stock' });
  }
});

// Procesar venta directa
router.post("/direct-sale", async (req: Request & { stockUpdate?: any }, res) => {
  try {
    console.log("📦 Procesando venta directa:", req.body);

    const { amount } = stockUpdateSchema.parse(req.body);
    console.log("✅ Cantidad validada:", amount);

    req.stockUpdate = await prepareStockUpdate(
      'direct_sale',
      parseFloat(amount),
      'admin'
    );

    await new Promise((resolve, reject) => {
      stockMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve(undefined);
      });
    });

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error en venta directa:', error);
    res.status(500).json({ error: 'Error al procesar la venta' });
  }
});

export default router;