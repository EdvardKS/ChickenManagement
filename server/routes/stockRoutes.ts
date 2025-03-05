import { Router } from 'express';
import { type Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

// Schema para validar cantidad
const directSaleSchema = z.object({
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
router.post("/direct-sale", async (req, res) => {
  try {
    console.log("📦 Procesando venta directa:", req.body);

    const { amount } = directSaleSchema.parse(req.body);
    console.log("✅ Cantidad validada:", amount);

    const currentStock = await storage.getCurrentStock();
    if (!currentStock) throw new Error('No stock found');

    const current = parseFloat(currentStock.currentStock);
    const change = parseFloat(amount);
    const newStock = (current + change).toString();

    console.log("🔄 Actualizando stock:", {
      current,
      change,
      newStock
    });

    const updatedStock = await storage.updateStock({
      currentStock: newStock,
      updateType: change < 0 ? 'venta_directa' : 'correccion_venta'
    });

    res.json(updatedStock);
  } catch (error) {
    console.error('❌ Error en venta directa:', error);
    res.status(500).json({ error: 'Error al procesar la venta' });
  }
});

export default router;