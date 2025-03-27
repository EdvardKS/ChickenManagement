import { Router } from 'express';
import { type Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { stockMiddleware, prepareStockUpdate } from '../middleware/stockMiddleware';
import { isHaykakan, isAuthenticated } from './authRoutes';

const router = Router();

// Schema para validar cantidad
const stockUpdateSchema = z.object({
  quantity: z.number(),
  updateType: z.enum(['mounted', 'sale', 'reset']).optional()
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

// Actualizar pollos montados (agregar) - admin only
router.post("/mounted/add", isHaykakan, async (req: Request & { stockUpdate?: any }, res) => {
  try {
    const { quantity } = stockUpdateSchema.parse(req.body);
    console.log("📦 Agregando pollos montados:", quantity);

    req.stockUpdate = await prepareStockUpdate(
      'add_mounted',
      quantity,
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
    console.error('❌ Error al agregar pollos montados:', error);
    res.status(500).json({ error: 'Error al agregar pollos montados' });
  }
});

// Actualizar pollos montados (quitar - corrección) - admin only
router.post("/mounted/remove", isHaykakan, async (req: Request & { stockUpdate?: any }, res) => {
  try {
    const { quantity } = stockUpdateSchema.parse(req.body);
    console.log("📦 Quitando pollos montados (corrección):", quantity);

    req.stockUpdate = await prepareStockUpdate(
      'remove_mounted',
      quantity,
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
    console.error('❌ Error al quitar pollos montados:', error);
    res.status(500).json({ error: 'Error al quitar pollos montados' });
  }
});

// Procesar venta directa sin encargo - admin only
router.post("/direct-sale", isHaykakan, async (req: Request & { stockUpdate?: any }, res) => {
  try {
    const { quantity } = stockUpdateSchema.parse(req.body);
    console.log("📦 Procesando venta directa sin encargo:", quantity);

    req.stockUpdate = await prepareStockUpdate(
      'direct_sale',
      quantity,
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
    res.status(500).json({ error: 'Error al procesar la venta directa' });
  }
});

// Corrección de venta directa - admin only
router.post("/direct-sale/correct", isHaykakan, async (req: Request & { stockUpdate?: any }, res) => {
  try {
    const { quantity } = stockUpdateSchema.parse(req.body);
    console.log("📦 Procesando corrección de venta directa:", quantity);

    req.stockUpdate = await prepareStockUpdate(
      'direct_sale_correction',
      quantity,
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
    console.error('❌ Error en corrección de venta directa:', error);
    res.status(500).json({ error: 'Error al procesar la corrección de venta' });
  }
});

// Resetear stock para el día actual - admin only
router.post("/reset", isHaykakan, async (req: Request & { stockUpdate?: any }, res) => {
  try {
    console.log("📦 Reseteando stock para el día actual");

    // Crear una nueva entrada en la base de datos para el día actual
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    req.stockUpdate = await prepareStockUpdate(
      'reset_stock',
      0, // La cantidad no importa en este caso
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
    console.error('❌ Error al resetear stock:', error);
    res.status(500).json({ error: 'Error al resetear el stock del día' });
  }
});

// Get stock history
router.get("/history", isAuthenticated, async (_req, res) => {
  try {
    const history = await storage.getStockHistory();
    res.json(history);
  } catch (error) {
    console.error('Error getting stock history:', error);
    res.status(500).json({ error: 'Error al obtener el historial de stock' });
  }
});

// Get stock history by stock ID
router.get("/history/:stockId", isAuthenticated, async (req, res) => {
  try {
    const stockId = parseInt(req.params.stockId);
    const history = await storage.getStockHistory(stockId);
    res.json(history);
  } catch (error) {
    console.error('Error getting stock history by ID:', error);
    res.status(500).json({ error: 'Error al obtener el historial de stock por ID' });
  }
});

export default router;