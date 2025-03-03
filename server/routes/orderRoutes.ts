import { Router } from 'express';
import { type Request, Response } from 'express';
import { storage } from '../storage';
import { stockMiddleware, prepareStockUpdate } from '../middleware/stockMiddleware';
import { insertOrderSchema } from '@shared/schema';

const router = Router();

// Get all orders
router.get("/", async (_req, res) => {
  try {
    const orders = await storage.getOrders();
    res.json(orders);
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({ error: 'Error al obtener los pedidos' });
  }
});

// Create new order
router.post("/", async (req: Request & { stockUpdate?: any }, res) => {
  try {
    const order = insertOrderSchema.parse(req.body);
    const created = await storage.createOrder(order);

    req.stockUpdate = await prepareStockUpdate(
      'new_order',
      parseFloat(created.quantity.toString()),
      'client'
    );

    await new Promise((resolve, reject) => {
      stockMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve(undefined);
      });
    });

    res.json(created);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Error al crear el pedido' });
  }
});

// Confirm order delivery
router.patch("/:id/confirm", async (req: Request & { stockUpdate?: any }, res) => {
  try {
    const id = parseInt(req.params.id);
    const order = await storage.getOrder(id);

    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    req.stockUpdate = await prepareStockUpdate(
      'order_delivered',
      parseFloat(order.quantity.toString()),
      'admin'
    );

    await new Promise((resolve, reject) => {
      stockMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve(undefined);
      });
    });

    const updatedOrder = await storage.updateOrder(id, {
      status: "completed",
      updatedAt: new Date()
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error confirming order:', error);
    res.status(500).json({ error: 'Error al confirmar el pedido' });
  }
});

// Mark order as error
router.patch("/:id/error", async (req: Request & { stockUpdate?: any }, res) => {
  try {
    const id = parseInt(req.params.id);
    const order = await storage.getOrder(id);

    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    req.stockUpdate = await prepareStockUpdate(
      'order_error',
      parseFloat(order.quantity.toString()),
      'admin'
    );

    await new Promise((resolve, reject) => {
      stockMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve(undefined);
      });
    });

    const updatedOrder = await storage.updateOrder(id, {
      deleted: true,
      status: "error",
      updatedAt: new Date()
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error marking order as error:', error);
    res.status(500).json({ error: 'Error al marcar el pedido como error' });
  }
});

// Update order status (including cancellation)
router.patch("/:id", async (req: Request & { stockUpdate?: any }, res) => {
  try {
    const id = parseInt(req.params.id);
    const orderData = req.body;
    const currentOrder = await storage.getOrder(id);

    if (!currentOrder) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    if (orderData.status === 'cancelled' && currentOrder.status !== 'cancelled') {
      req.stockUpdate = await prepareStockUpdate(
        'order_cancelled',
        parseFloat(currentOrder.quantity.toString()),
        'admin'
      );

      await new Promise((resolve, reject) => {
        stockMiddleware(req, res, (err) => {
          if (err) reject(err);
          else resolve(undefined);
        });
      });
    }

    const updated = await storage.updateOrder(id, orderData);
    res.json(updated);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Error al actualizar el pedido' });
  }
});

// Delete order
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteOrder(id);
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Error al eliminar el pedido' });
  }
});

export default router;
