import { Router } from 'express';
import { type Request, Response } from 'express';
import { storage } from '../storage';
import { stockMiddleware, prepareStockUpdate } from '../middleware/stockMiddleware';
import { insertOrderSchema } from '@shared/schema';
import { z } from 'zod';

const router = Router();

// Update order schema for PATCH requests
const updateOrderSchema = z.object({
  customerName: z.string(),
  quantity: z.string(),
  details: z.string().nullable(),
  pickupTime: z.string(),
  customerPhone: z.string().nullable(),
  customerEmail: z.string().nullable(),
  status: z.string().nullable(),
  deleted: z.boolean().nullable()
});

// Update order status
router.patch("/:id", async (req: Request & { stockUpdate?: any }, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log('🔄 Update Order - Request received for order:', id);
    console.log('📝 Update Order - Request body:', req.body);

    const currentOrder = await storage.getOrder(id);
    console.log('📌 Update Order - Current order state:', currentOrder);

    if (!currentOrder) {
      console.log('❌ Update Order - Order not found:', id);
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    // Verificar si es un pedido de un día anterior
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const orderDate = new Date(currentOrder.pickupTime);
    orderDate.setHours(0, 0, 0, 0);
    const isPastOrder = orderDate < today;

    console.log('🗓️ Update Order - Date check:', { 
      orderDate: orderDate.toISOString(), 
      today: today.toISOString(), 
      isPastOrder 
    });

    try {
      // Validate the request body
      const validatedData = updateOrderSchema.parse(req.body);
      console.log('✅ Update Order - Validated data:', validatedData);

      // Convert pickupTime string to Date
      const pickupTime = new Date(validatedData.pickupTime);
      if (isNaN(pickupTime.getTime())) {
        throw new Error('Invalid pickup time');
      }

      const updatedOrderData = {
        ...validatedData,
        pickupTime,
        updatedAt: new Date()
      };

      console.log('📤 Update Order - Preparing to update with data:', updatedOrderData);

      if (req.body.status === 'cancelled' && currentOrder.status !== 'cancelled') {
        req.stockUpdate = await prepareStockUpdate(
          'cancel_order',
          parseFloat(currentOrder.quantity.toString()),
          'admin',
          isPastOrder
        );

        await new Promise((resolve, reject) => {
          stockMiddleware(req, res, (err) => {
            if (err) reject(err);
            else resolve(undefined);
          });
        });
      }

      const updated = await storage.updateOrder(id, updatedOrderData);
      console.log('✨ Update Order - Successfully updated:', updated);

      res.json(updated);
    } catch (validationError) {
      console.error('❌ Update Order - Validation error:', validationError);
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: validationError instanceof Error ? validationError.message : 'Error de validación'
      });
    }
  } catch (error) {
    console.error('❌ Update Order - Server error:', error);
    res.status(500).json({ error: 'Error al actualizar el pedido' });
  }
});

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
    console.log('📝 Create Order - Request body:', req.body);
    
    // Intenta validar el objeto de pedido
    let order;
    try {
      order = insertOrderSchema.parse(req.body);
      console.log('✅ Create Order - Validated order data:', order);
    } catch (validationError: any) {
      console.error('❌ Create Order - Validation error:', validationError);
      return res.status(400).json({ 
        error: 'Datos de pedido inválidos', 
        details: validationError.errors || validationError.message || 'Error de validación',
        receivedData: req.body
      });
    }
    
    // Crear el pedido en la base de datos
    const created = await storage.createOrder(order);
    console.log('✨ Create Order - Order created in database:', created);

    // Verificar si es un pedido para un día pasado
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const orderDate = new Date(created.pickupTime);
    orderDate.setHours(0, 0, 0, 0);
    const isPastOrder = orderDate < today;

    console.log('🗓️ Create Order - Date check:', { 
      id: created.id, 
      orderDate: orderDate.toISOString(), 
      today: today.toISOString(), 
      isPastOrder 
    });

    // Asegurarse de que quantity sea un número
    const quantityValue = typeof created.quantity === 'string' 
      ? parseFloat(created.quantity) 
      : Number(created.quantity);
      
    if (isNaN(quantityValue)) {
      console.error('❌ Create Order - Invalid quantity value:', created.quantity);
      return res.status(400).json({ error: 'Cantidad inválida en el pedido' });
    }

    console.log('📦 Create Order - Preparing stock update with quantity:', quantityValue);
    
    try {
      req.stockUpdate = await prepareStockUpdate(
        'new_order',
        quantityValue,
        'client',
        isPastOrder
      );
      
      console.log('📦 Create Order - Stock update prepared:', req.stockUpdate);

      await new Promise((resolve, reject) => {
        stockMiddleware(req, res, (err) => {
          if (err) {
            console.error('❌ Create Order - Stock middleware error:', err);
            reject(err);
          } else {
            resolve(undefined);
          }
        });
      });
      
      console.log('✅ Create Order - Order and stock successfully updated');
      res.json(created);
    } catch (stockError: any) {
      console.error('❌ Create Order - Stock update error:', stockError);
      // El pedido ya se creó, pero hubo un error al actualizar el stock
      return res.status(500).json({ 
        error: 'Error al actualizar el stock', 
        details: stockError.message || 'Error desconocido en actualización de stock',
        order: created
      });
    }
  } catch (error: any) {
    console.error('❌ Create Order - Unexpected error:', error);
    console.error('Request body:', JSON.stringify(req.body, null, 2));
    res.status(500).json({ 
      error: 'Error al crear el pedido', 
      details: error.message || 'Error inesperado'
    });
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

    // Verificar si es un pedido de un día anterior
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const orderDate = new Date(order.pickupTime);
    orderDate.setHours(0, 0, 0, 0);
    const isPastOrder = orderDate < today;

    console.log('Confirmando pedido:', { 
      id, 
      orderDate: orderDate.toISOString(), 
      today: today.toISOString(), 
      isPastOrder 
    });

    req.stockUpdate = await prepareStockUpdate(
      'order_delivered',
      parseFloat(order.quantity.toString()),
      'admin',
      isPastOrder
    );

    await new Promise((resolve, reject) => {
      stockMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve(undefined);
      });
    });

    // Actualizar estado y marcar como eliminado
    const updatedOrder = await storage.updateOrder(id, {
      status: "delivered",
      deleted: true
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error confirming order:', error);
    res.status(500).json({ error: 'Error al confirmar el pedido' });
  }
});

// Cancel order
router.patch("/:id/cancel", async (req: Request & { stockUpdate?: any }, res) => {
  try {
    const id = parseInt(req.params.id);
    const order = await storage.getOrder(id);

    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    // Verificar si es un pedido de un día anterior
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const orderDate = new Date(order.pickupTime);
    orderDate.setHours(0, 0, 0, 0);
    const isPastOrder = orderDate < today;

    console.log('Cancelando pedido:', { 
      id, 
      orderDate: orderDate.toISOString(), 
      today: today.toISOString(), 
      isPastOrder 
    });

    req.stockUpdate = await prepareStockUpdate(
      'cancel_order',
      parseFloat(order.quantity.toString()),
      'admin',
      isPastOrder
    );

    await new Promise((resolve, reject) => {
      stockMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve(undefined);
      });
    });

    // Actualizar estado y marcar como eliminado
    const updatedOrder = await storage.updateOrder(id, {
      status: "cancelled",
      deleted: true
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: 'Error al cancelar el pedido' });
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

    // Verificar si es un pedido de un día anterior
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const orderDate = new Date(order.pickupTime);
    orderDate.setHours(0, 0, 0, 0);
    const isPastOrder = orderDate < today;

    console.log('Marcando pedido como error:', { 
      id, 
      orderDate: orderDate.toISOString(), 
      today: today.toISOString(), 
      isPastOrder 
    });

    req.stockUpdate = await prepareStockUpdate(
      'order_error',
      parseFloat(order.quantity.toString()),
      'admin',
      isPastOrder
    );

    await new Promise((resolve, reject) => {
      stockMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve(undefined);
      });
    });

    // Actualizar estado y marcar como eliminado
    const updatedOrder = await storage.updateOrder(id, {
      status: "error",
      deleted: true
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error marking order as error:', error);
    res.status(500).json({ error: 'Error al marcar el pedido como error' });
  }
});

export default router;