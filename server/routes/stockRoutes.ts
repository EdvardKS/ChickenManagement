import { Router } from 'express';
import { type Request, Response } from 'express';
import { storage } from '../storage';
import { stockMiddleware, prepareStockUpdate } from '../middleware/stockMiddleware';

const router = Router();

// Get current stock status
router.get("/", async (_req, res) => {
  try {
    console.log('Getting current stock and orders');
    const stock = await storage.getCurrentStock();
    const orders = await storage.getOrders();

    // Filtrar pedidos de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log('Calculating reserved stock for today:', today);
    // Calcular el stock reservado basado solo en los pedidos pendientes de hoy
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
    console.log('Current stock:', currentStock, 'Reserved stock:', reservedStock);

    const response = {
      ...stock,
      reservedStock,
      unreservedStock: currentStock - reservedStock,
    };

    console.log('Stock response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error getting stock:', error);
    res.status(500).json({ error: 'Error al obtener el stock' });
  }
});

// Add stock
router.post("/add", async (req: Request & { stockUpdate?: any }, res) => {
  try {
    const { quantity } = req.body;
    console.log('Adding stock quantity:', quantity);

    req.stockUpdate = await prepareStockUpdate(
      'direct_sale_correction',
      Math.abs(parseFloat(quantity)),
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
    console.error('Error adding stock:', error);
    res.status(500).json({ error: 'Error al añadir stock' });
  }
});

// Remove stock (direct sale)
router.post("/remove", async (req: Request & { stockUpdate?: any }, res) => {
  try {
    const { quantity } = req.body;
    console.log('Removing stock quantity:', quantity);

    req.stockUpdate = await prepareStockUpdate(
      'direct_sale',
      Math.abs(parseFloat(quantity)),
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
    console.error('Error removing stock:', error);
    res.status(500).json({ error: 'Error al quitar stock' });
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