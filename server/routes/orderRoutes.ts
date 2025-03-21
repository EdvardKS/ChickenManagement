import { Router } from 'express';
import { type Request, Response } from 'express';
import { storage } from '../storage';
import { stockMiddleware, prepareStockUpdate } from '../middleware/stockMiddleware';
import { insertOrderSchema } from '@shared/schema';
import { z } from 'zod';
import { isHaykakan } from './authRoutes';

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
router.patch("/:id", isHaykakan, async (req: Request & { stockUpdate?: any }, res) => {
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
router.post("/", isHaykakan, async (req: Request & { stockUpdate?: any, session?: any }, res) => {
  // Comprobar información de autenticación (para depuración)
  console.log('🔒 Create Order - Información de sesión:', req.session);
  console.log('🔒 Create Order - Headers de autenticación:', req.headers.authorization);
  console.log('🔒 Create Order - Usuario en sesión:', req.session?.userId, req.session?.username);
  
  try {
    console.log('📝 Create Order - Request recibida');
    console.log('📝 Create Order - Headers:', req.headers);
    console.log('📝 Create Order - Método:', req.method);
    console.log('📝 Create Order - URL:', req.url);
    console.log('📝 Create Order - Request body:', req.body);
    console.log('📝 Create Order - Tipo de datos body:', typeof req.body);
    
    // Examinar la estructura y tipos de datos del body
    if (req.body) {
      console.log('📝 Create Order - Detalle de campos:');
      Object.entries(req.body).forEach(([key, value]) => {
        console.log(`   - ${key}: ${typeof value} = ${JSON.stringify(value)}`);
      });
    }
    
    // Intenta validar el objeto de pedido
    let order;
    try {
      console.log('🔍 Create Order - Validando contra schema:', JSON.stringify(insertOrderSchema, null, 2));
      order = insertOrderSchema.parse(req.body);
      console.log('✅ Create Order - Validated order data:', order);
      
      // Verificar explícitamente cada campo requerido
      console.log('🔍 Create Order - Validación de campos individuales:');
      console.log('   - customerName:', order.customerName, typeof order.customerName);
      console.log('   - quantity:', order.quantity, typeof order.quantity);
      console.log('   - pickupTime:', order.pickupTime, typeof order.pickupTime);
      
      // Verificar que quantity sea un múltiplo de 0.5
      const isValidQuantity = order.quantity % 0.5 === 0;
      console.log('   - ¿Cantidad válida (múltiplo de 0.5)?', isValidQuantity);
      
      // Verificar que pickupTime sea una fecha válida
      const isValidDate = !isNaN(new Date(order.pickupTime).getTime());
      console.log('   - ¿Fecha válida?', isValidDate);
    } catch (validationError: any) {
      console.error('❌ Create Order - Validation error:', validationError);
      console.error('❌ Create Order - Error format:', validationError.format ? validationError.format() : 'No format method');
      
      // Analizar errores de validación en detalle
      if (validationError.errors) {
        console.error('❌ Create Order - Validation errors detail:');
        validationError.errors.forEach((err: any, index: number) => {
          console.error(`   [${index}] Path: ${err.path}, Code: ${err.code}, Message: ${err.message}`);
        });
      }
      
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
router.patch("/:id/confirm", isHaykakan, async (req: Request & { stockUpdate?: any }, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log('✅ Confirm Order - Request received for order:', id);
    
    if (isNaN(id)) {
      console.error('❌ Confirm Order - Invalid order ID:', req.params.id);
      return res.status(400).json({ 
        error: 'ID de pedido inválido', 
        details: 'El ID debe ser un número válido'
      });
    }
    
    const order = await storage.getOrder(id);

    if (!order) {
      console.error('❌ Confirm Order - Order not found:', id);
      return res.status(404).json({ 
        error: 'Pedido no encontrado',
        details: `No existe un pedido con ID: ${id}`
      });
    }

    // Verificar si es un pedido de un día anterior
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const orderDate = new Date(order.pickupTime);
    orderDate.setHours(0, 0, 0, 0);
    const isPastOrder = orderDate < today;

    console.log('🗓️ Confirm Order - Date check:', { 
      id, 
      orderDate: orderDate.toISOString(), 
      today: today.toISOString(), 
      isPastOrder 
    });

    // Verificar estado actual para evitar procesos duplicados
    if (order.status === 'delivered') {
      console.warn('⚠️ Confirm Order - Order already delivered:', id);
      return res.status(409).json({ 
        error: 'Pedido ya entregado',
        details: 'Este pedido ya ha sido marcado como entregado anteriormente'
      });
    }

    // Preparar actualización de stock solo si es necesario
    try {
      const quantityValue = parseFloat(order.quantity.toString());
      if (isNaN(quantityValue)) {
        throw new Error(`Valor de cantidad inválido: ${order.quantity}`);
      }
      
      console.log('📦 Confirm Order - Preparing stock update with quantity:', quantityValue);
      
      req.stockUpdate = await prepareStockUpdate(
        'order_delivered',
        quantityValue,
        'admin',
        isPastOrder
      );

      // Procesar actualización de stock
      await new Promise((resolve, reject) => {
        stockMiddleware(req, res, (err) => {
          if (err) {
            console.error('❌ Confirm Order - Stock middleware error:', err);
            reject(err);
          } else {
            resolve(undefined);
          }
        });
      });
      
      console.log('✅ Confirm Order - Stock update successful');
    } catch (stockError: any) {
      console.error('❌ Confirm Order - Stock update error:', stockError);
      return res.status(500).json({ 
        error: 'Error al actualizar el stock', 
        details: stockError.message || 'Error desconocido en actualización de stock',
        order
      });
    }

    // Actualizar estado y marcar como eliminado
    try {
      const updatedOrder = await storage.updateOrder(id, {
        status: "delivered",
        deleted: true
      });
      
      console.log('✨ Confirm Order - Successfully updated order status to delivered:', id);
      res.json(updatedOrder);
    } catch (dbError: any) {
      console.error('❌ Confirm Order - Database update error:', dbError);
      return res.status(500).json({ 
        error: 'Error al actualizar el estado del pedido', 
        details: dbError.message || 'Error inesperado en la base de datos'
      });
    }
  } catch (error: any) {
    console.error('❌ Confirm Order - Unexpected error:', error);
    res.status(500).json({ 
      error: 'Error al confirmar el pedido',
      details: error.message || 'Error inesperado del servidor',
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  }
});

// Cancel order
router.patch("/:id/cancel", isHaykakan, async (req: Request & { stockUpdate?: any }, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log('❌ Cancel Order - Request received for order:', id);
    
    if (isNaN(id)) {
      console.error('❌ Cancel Order - Invalid order ID:', req.params.id);
      return res.status(400).json({ 
        error: 'ID de pedido inválido', 
        details: 'El ID debe ser un número válido'
      });
    }
    
    const order = await storage.getOrder(id);

    if (!order) {
      console.error('❌ Cancel Order - Order not found:', id);
      return res.status(404).json({ 
        error: 'Pedido no encontrado',
        details: `No existe un pedido con ID: ${id}`
      });
    }

    // Verificar si es un pedido de un día anterior
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const orderDate = new Date(order.pickupTime);
    orderDate.setHours(0, 0, 0, 0);
    const isPastOrder = orderDate < today;

    console.log('🗓️ Cancel Order - Date check:', { 
      id, 
      orderDate: orderDate.toISOString(), 
      today: today.toISOString(), 
      isPastOrder 
    });

    // Verificar estado actual para evitar procesos duplicados
    if (order.status === 'cancelled') {
      console.warn('⚠️ Cancel Order - Order already cancelled:', id);
      return res.status(409).json({ 
        error: 'Pedido ya cancelado',
        details: 'Este pedido ya ha sido marcado como cancelado anteriormente'
      });
    }

    // Preparar actualización de stock solo si es necesario
    try {
      const quantityValue = parseFloat(order.quantity.toString());
      if (isNaN(quantityValue)) {
        throw new Error(`Valor de cantidad inválido: ${order.quantity}`);
      }
      
      console.log('📦 Cancel Order - Preparing stock update with quantity:', quantityValue);
      
      req.stockUpdate = await prepareStockUpdate(
        'cancel_order',
        quantityValue,
        'admin',
        isPastOrder
      );

      // Procesar actualización de stock
      await new Promise((resolve, reject) => {
        stockMiddleware(req, res, (err) => {
          if (err) {
            console.error('❌ Cancel Order - Stock middleware error:', err);
            reject(err);
          } else {
            resolve(undefined);
          }
        });
      });
      
      console.log('✅ Cancel Order - Stock update successful');
    } catch (stockError: any) {
      console.error('❌ Cancel Order - Stock update error:', stockError);
      return res.status(500).json({ 
        error: 'Error al actualizar el stock', 
        details: stockError.message || 'Error desconocido en actualización de stock',
        order
      });
    }

    // Actualizar estado y marcar como eliminado
    try {
      const updatedOrder = await storage.updateOrder(id, {
        status: "cancelled",
        deleted: true
      });
      
      console.log('✨ Cancel Order - Successfully updated order status to cancelled:', id);
      res.json(updatedOrder);
    } catch (dbError: any) {
      console.error('❌ Cancel Order - Database update error:', dbError);
      return res.status(500).json({ 
        error: 'Error al actualizar el estado del pedido', 
        details: dbError.message || 'Error inesperado en la base de datos'
      });
    }
  } catch (error: any) {
    console.error('❌ Cancel Order - Unexpected error:', error);
    res.status(500).json({ 
      error: 'Error al cancelar el pedido',
      details: error.message || 'Error inesperado del servidor',
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  }
});

// Mark order as error
router.patch("/:id/error", async (req: Request & { stockUpdate?: any }, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log('⚠️ Error Order - Request received for order:', id);
    
    if (isNaN(id)) {
      console.error('❌ Error Order - Invalid order ID:', req.params.id);
      return res.status(400).json({ 
        error: 'ID de pedido inválido', 
        details: 'El ID debe ser un número válido'
      });
    }
    
    const order = await storage.getOrder(id);

    if (!order) {
      console.error('❌ Error Order - Order not found:', id);
      return res.status(404).json({ 
        error: 'Pedido no encontrado',
        details: `No existe un pedido con ID: ${id}`
      });
    }

    // Verificar si es un pedido de un día anterior
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const orderDate = new Date(order.pickupTime);
    orderDate.setHours(0, 0, 0, 0);
    const isPastOrder = orderDate < today;

    console.log('🗓️ Error Order - Date check:', { 
      id, 
      orderDate: orderDate.toISOString(), 
      today: today.toISOString(), 
      isPastOrder 
    });

    // Verificar estado actual para evitar procesos duplicados
    if (order.status === 'error') {
      console.warn('⚠️ Error Order - Order already marked as error:', id);
      return res.status(409).json({ 
        error: 'Pedido ya marcado como error',
        details: 'Este pedido ya ha sido marcado como error anteriormente'
      });
    }

    // Preparar actualización de stock solo si es necesario
    try {
      const quantityValue = parseFloat(order.quantity.toString());
      if (isNaN(quantityValue)) {
        throw new Error(`Valor de cantidad inválido: ${order.quantity}`);
      }
      
      console.log('📦 Error Order - Preparing stock update with quantity:', quantityValue);
      
      req.stockUpdate = await prepareStockUpdate(
        'order_error',
        quantityValue,
        'admin',
        isPastOrder
      );

      // Procesar actualización de stock
      await new Promise((resolve, reject) => {
        stockMiddleware(req, res, (err) => {
          if (err) {
            console.error('❌ Error Order - Stock middleware error:', err);
            reject(err);
          } else {
            resolve(undefined);
          }
        });
      });
      
      console.log('✅ Error Order - Stock update successful');
    } catch (stockError: any) {
      console.error('❌ Error Order - Stock update error:', stockError);
      return res.status(500).json({ 
        error: 'Error al actualizar el stock', 
        details: stockError.message || 'Error desconocido en actualización de stock',
        order
      });
    }

    // Actualizar estado y marcar como eliminado
    try {
      const updatedOrder = await storage.updateOrder(id, {
        status: "error",
        deleted: true
      });
      
      console.log('✨ Error Order - Successfully updated order status to error:', id);
      res.json(updatedOrder);
    } catch (dbError: any) {
      console.error('❌ Error Order - Database update error:', dbError);
      return res.status(500).json({ 
        error: 'Error al actualizar el estado del pedido', 
        details: dbError.message || 'Error inesperado en la base de datos'
      });
    }
  } catch (error: any) {
    console.error('❌ Error Order - Unexpected error:', error);
    res.status(500).json({ 
      error: 'Error al marcar el pedido como error',
      details: error.message || 'Error inesperado del servidor',
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  }
});

export default router;