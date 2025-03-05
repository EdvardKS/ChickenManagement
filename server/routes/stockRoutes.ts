import { Router } from 'express';
import { type Request, Response } from 'express';
import { storage } from '../storage';
import { stockMiddleware, prepareStockUpdate } from '../middleware/stockMiddleware';
import { z } from 'zod';

const router = Router();

// Schema para validar actualizaciones de stock
const stockUpdateSchema = z.object({
  quantity: z.string(),
  updateType: z.enum(['mounted', 'direct_sale', 'direct_sale_correction', 'order']).optional()
});

// Get current stock status
router.get("/", async (_req, res) => {
  try {
    const stock = await storage.getCurrentStock();
    const orders = await storage.getOrders();

    // Filtrar pedidos de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log('[Stock Route] Calculando stock reservado para hoy:', today);
    const reservedStock = orders
      .filter(order => {
        const orderDate = new Date(order.pickupTime);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime() &&
               order.status === "pending" &&
               !order.deleted;
      })
      .reduce((total, order) => total + parseFloat(order.quantity.toString()), 0);

    const currentStock = parseFloat((stock?.currentStock || 0).toString());
    console.log('[Stock Route] Stock actual:', currentStock, 'Stock reservado:', reservedStock);

    const response = {
      ...stock,
      reservedStock: reservedStock.toString(),
      unreservedStock: (currentStock - reservedStock).toString()
    };

    res.json(response);
  } catch (error) {
    console.error('[Stock Route] Error obteniendo stock:', error);
    res.status(500).json({ error: 'Error al obtener el stock' });
  }
});

// Update stock (nueva ruta para actualizar stock montado)
router.post("/update", async (req: Request & { stockUpdate?: any }, res) => {
  try {
    console.log('Updating stock with data:', req.body);
    const data = stockUpdateSchema.parse(req.body); // Use the updated schema

    const current = await storage.getCurrentStock();
    if (!current) throw new Error('No stock found');

    const initialStock = parseFloat(data.quantity); // Use quantity from the schema
    const currentInitialStock = parseFloat(current.initialStock);

    req.stockUpdate = await prepareStockUpdate(
      'add_mounted',
      initialStock - currentInitialStock,
      'admin'
    );

    await new Promise((resolve, reject) => {
      stockMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve(undefined);
      });
    });

    res.json(await storage.getCurrentStock());
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ error: 'Error al actualizar el stock' });
  }
});


// Remover stock (venta directa)
router.post("/remove", async (req: Request & { stockUpdate?: any }, res) => {
  try {
    console.log('[Stock Route] Procesando venta directa. Body:', req.body);
    const { quantity } = stockUpdateSchema.parse(req.body);

    const parsedQuantity = parseFloat(quantity);
    console.log('[Stock Route] Cantidad para venta:', parsedQuantity);

    req.stockUpdate = await prepareStockUpdate(
      'direct_sale',
      parsedQuantity,
      'admin'
    );

    console.log('[Stock Route] Stock update preparado:', req.stockUpdate);

    await new Promise((resolve, reject) => {
      stockMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve(undefined);
      });
    });

    const updatedStock = await storage.getCurrentStock();
    console.log('[Stock Route] Stock actualizado después de venta:', updatedStock);

    res.json(updatedStock);
  } catch (error) {
    console.error('[Stock Route] Error en venta directa:', error);
    res.status(500).json({ error: 'Error al procesar la venta' });
  }
});

// Añadir stock (corrección de venta)
router.post("/add", async (req: Request & { stockUpdate?: any }, res) => {
  try {
    console.log('[Stock Route] Procesando corrección. Body:', req.body);
    const { quantity } = stockUpdateSchema.parse(req.body);

    const parsedQuantity = parseFloat(quantity);
    console.log('[Stock Route] Cantidad para corrección:', parsedQuantity);

    req.stockUpdate = await prepareStockUpdate(
      'direct_sale_correction',
      parsedQuantity,
      'admin'
    );

    console.log('[Stock Route] Stock update preparado:', req.stockUpdate);

    await new Promise((resolve, reject) => {
      stockMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve(undefined);
      });
    });

    const updatedStock = await storage.getCurrentStock();
    console.log('[Stock Route] Stock actualizado después de corrección:', updatedStock);

    res.json(updatedStock);
  } catch (error) {
    console.error('[Stock Route] Error en corrección:', error);
    res.status(500).json({ error: 'Error al procesar la corrección' });
  }
});

// Reset stock
router.post("/reset", async (req: Request & { stockUpdate?: any }, res) => {
  try {
    console.log('Resetting stock');

    req.stockUpdate = await prepareStockUpdate(
      'reset_stock',
      0,
      'admin'
    );

    await new Promise((resolve, reject) => {
      stockMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve(undefined);
      });
    });

    res.json(await storage.getCurrentStock());
  } catch (error) {
    console.error('Error resetting stock:', error);
    res.status(500).json({ error: 'Error al resetear el stock' });
  }
});

export default router;