import { Router } from 'express';
import { type Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

// Schema para validar cantidad
const sellSchema = z.object({
  quantity: z.string()
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

    const currentStock = parseFloat((stock?.currentStock || "0").toString());

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

// Venta directa o corrección
router.post("/sell", async (req, res) => {
  try {
    const { quantity } = sellSchema.parse(req.body);

    const currentStock = await storage.getCurrentStock();
    if (!currentStock) throw new Error('No stock found');

    // Calcular nuevo current_stock
    const current = parseFloat(currentStock.currentStock);
    const change = parseFloat(quantity);
    const newCurrentStock = (current + change).toString();

    // Actualizar stock
    const updatedStock = await storage.updateStock({
      currentStock: newCurrentStock,
      updateType: 'direct_sale'
    });

    res.json(updatedStock);
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ error: 'Error al actualizar el stock' });
  }
});

export default router;