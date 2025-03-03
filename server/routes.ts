import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import cron from "node-cron";
import { insertOrderSchema, insertProductSchema, insertCategorySchema, insertSettingsSchema } from "@shared/schema";
import { scrapeGoogleBusinessHours, updateGoogleBusinessHours } from "./scraper";
import { format } from "date-fns";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import fs from "fs-extra";
import path from "path";
import { db } from './db';
import { desc, sql, and, eq } from 'drizzle-orm';
import { stockHistory, orders, categories, products, settings } from '@shared/schema';
import multer from 'multer';
import { handleStockUpdate } from "./middleware/stockMiddleware";

// Configuración de multer para guardar imágenes
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.path.includes('products') ? 'products' : 'categories';
    const dir = path.join(process.cwd(), 'client', 'public', 'img', type);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: multerStorage });

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Ruta de inicialización
  app.post("/api/admin/initialize", async (_req, res) => {
    try {
      // Verificar si ya existen horarios
      const existingHours = await storage.getBusinessHours();

      if (existingHours.length === 0) {
        // Crear horarios por defecto para cada día de la semana
        for (let i = 0; i < 7; i++) {
          await storage.createBusinessHours({
            dayOfWeek: i,
            openTime: "10:00",
            closeTime: "22:00",
            isOpen: i < 5, // Cerrado sábado y domingo por defecto
            autoUpdate: true
          });
        }
      }

      // Crear directorios para imágenes si no existen
      const imageDirectories = [
        path.join(process.cwd(), 'client', 'public', 'img', 'products'),
        path.join(process.cwd(), 'client', 'public', 'img', 'categories')
      ];

      for (const dir of imageDirectories) {
        await fs.ensureDir(dir);
      }

      // Crear stock inicial si no existe
      const currentStock = await storage.getCurrentStock();
      if (!currentStock) {
        await storage.updateStock({
          date: new Date(),
          initialStock: 0,
          currentStock: 0,
          reservedStock: 0,
          unreservedStock: 0
        });
      }

      res.json({ message: "Sistema inicializado correctamente" });
    } catch (error) {
      console.error("Error initializing system:", error);
      res.status(500).json({ error: "Error al inicializar el sistema" });
    }
  });

  // Stock Management Routes
  app.get("/api/stockActually", async (_req, res) => {
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
  // Stock Management Routes
  app.get("/api/stock", async (_req, res) => {
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

  app.post("/api/stock/add", async (req, res, next) => {
    try {
      const { quantity } = req.body;

      res.locals.stockUpdate = {
        action: 'add',
        quantity: parseFloat(quantity),
        source: 'admin'
      };

      await handleStockUpdate(req, res, next);

      const currentStock = await storage.getCurrentStock();
      res.json(currentStock);
    } catch (error) {
      console.error('Error adding stock:', error);
      res.status(500).json({ error: 'Error al añadir stock' });
    }
  });

  // Confirmar pedido
  app.patch("/api/orders/:id/confirm", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);

      if (!order) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }

      res.locals.stockUpdate = {
        action: 'complete',
        quantity: parseFloat(order.quantity.toString()),
        source: 'admin',
        orderId: id
      };

      await handleStockUpdate(req, res, next);

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

  // Marcar pedido como error
  app.patch("/api/orders/:id/error", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);

      if (!order) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }

      res.locals.stockUpdate = {
        action: 'error',
        quantity: parseFloat(order.quantity.toString()),
        source: 'admin',
        orderId: id
      };

      await handleStockUpdate(req, res, next);

      const updatedOrder = await storage.updateOrder(id, {
        status: "error",
        deleted: true,
        updatedAt: new Date()
      });

      res.json(updatedOrder);
    } catch (error) {
      console.error('Error marking order as error:', error);
      res.status(500).json({ error: 'Error al marcar el pedido como error' });
    }
  });

  app.patch("/api/orders/:id/cancel", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);

      if (!order) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }

      res.locals.stockUpdate = {
        action: 'cancel',
        quantity: parseFloat(order.quantity.toString()),
        source: 'admin',
        orderId: id
      };

      await handleStockUpdate(req, res, next);

      const updatedOrder = await storage.updateOrder(id, {
        status: "cancelled",
        deleted: true,
        updatedAt: new Date()
      });

      res.json(updatedOrder);
    } catch (error) {
      console.error('Error cancelling order:', error);
      res.status(500).json({ error: 'Error al cancelar el pedido' });
    }
  });


  app.post("/api/stock/remove", async (req, res, next) => {
    try {
      const { quantity } = req.body;

      res.locals.stockUpdate = {
        action: 'subtract',
        quantity: parseFloat(quantity),
        source: 'admin'
      };

      await handleStockUpdate(req, res, next);

      const currentStock = await storage.getCurrentStock();
      res.json(currentStock);
    } catch (error) {
      console.error('Error removing stock:', error);
      res.status(500).json({ error: 'Error al quitar stock' });
    }
  });

  app.post("/api/stock/sell", async (req, res) => {
    try {
      const { quantity } = req.body;
      const currentStock = await storage.getCurrentStock();
      const updatedStock = {
        ...currentStock,
        currentStock: parseFloat((currentStock?.currentStock || 0).toString()) - parseFloat(quantity),
      };
      const result = await storage.updateStock(updatedStock);
      res.json(result);
    } catch (error) {
      console.error('Error selling stock:', error);
      res.status(500).json({ error: 'Error al vender stock' });
    }
  });

  app.post("/api/stock/reset", async (req, res, next) => {
    try {
      res.locals.stockUpdate = {
        action: 'reset',
        quantity: 0,
        source: 'admin'
      };

      await handleStockUpdate(req, res, next);

      const currentStock = await storage.getCurrentStock();
      res.json(currentStock);
    } catch (error) {
      console.error('Error resetting stock:', error);
      res.status(500).json({ error: 'Error al resetear el stock' });
    }
  });

  // Admin routes for database management
  app.post("/api/admin/run-migrations", async (_req, res) => {
    try {
      // Execute migrations
      await db.push(); // Assuming 'db' is defined elsewhere
      res.json({ message: "Migraciones ejecutadas correctamente" });
    } catch (error) {
      console.error("Error al ejecutar las migraciones:", error);
      res.status(500).json({ message: "Error al ejecutar las migraciones" });
    }
  });

  app.post("/api/admin/run-seeders", async (_req, res) => {
    try {
      // Insert seed data
      const categories = [
        {
          name: "Pollos Asados",
          description: "Nuestros famosos pollos asados a la leña",
          imageUrl: "/img/categories/pollos.jpg"
        },
        {
          name: "Guarniciones",
          description: "Acompañamientos perfectos para tu pollo",
          imageUrl: "/img/categories/guarniciones.jpg"
        }
      ];

      const products = [
        {
          name: "Pollo Asado Entero",
          description: "Pollo entero asado a la leña con nuestro toque especial",
          price: 1500,
          imageUrl: "/img/products/pollo-entero.jpg",
          categoryId: 1
        },
        {
          name: "Medio Pollo",
          description: "Medio pollo asado a la leña",
          price: 800,
          imageUrl: "/img/products/medio-pollo.jpg",
          categoryId: 1
        },
        {
          name: "Patatas Asadas",
          description: "Patatas asadas con especias",
          price: 400,
          imageUrl: "/img/products/patatas.jpg",
          categoryId: 2
        }
      ];

      for (const category of categories) {
        await storage.createCategory(category);
      }

      for (const product of products) {
        await storage.createProduct(product);
      }

      res.json({ message: "Datos de prueba insertados correctamente" });
    } catch (error) {
      console.error("Error al ejecutar los seeders:", error);
      res.status(500).json({ message: "Error al ejecutar los seeders" });
    }
  });

  // Categories
  app.get("/api/categories", async (_req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error getting categories:', error);
      res.status(500).json({ error: 'Error al obtener las categorías' });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const category = insertCategorySchema.parse(req.body);
      const created = await storage.createCategory(category);
      res.json(created);
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(500).json({ error: 'Error al crear la categoría' });
    }
  });

  app.patch("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = insertCategorySchema.partial().parse(req.body);
      const updated = await storage.updateCategory(id, category);
      res.json(updated);
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).json({ error: 'Error al actualizar la categoría' });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.update(categories)
        .set({ deleted: true })
        .where(eq(categories.id, id));
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ error: 'Error al eliminar la categoría' });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      const products = await storage.getProducts(categoryId);
      res.json(products);
    } catch (error) {
      console.error('Error getting products:', error);
      res.status(500).json({ error: 'Error al obtener los productos' });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const product = insertProductSchema.parse(req.body);
      const created = await storage.createProduct(product);
      res.json(created);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: 'Error al crear el producto' });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = insertProductSchema.partial().parse(req.body);
      const updated = await storage.updateProduct(id, product);
      res.json(updated);
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Error al actualizar el producto' });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.update(products)
        .set({ deleted: true })
        .where(eq(products.id, id));
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Error al eliminar el producto' });
    }
  });

  // Orders
  app.get("/api/orders", async (_req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error('Error getting orders:', error);
      res.status(500).json({ error: 'Error al obtener los pedidos' });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const order = insertOrderSchema.parse(req.body);
      const created = await storage.createOrder(order);
      res.json(created);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Error al crear el pedido' });
    }
  });

  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = insertOrderSchema.partial().parse(req.body);
      const updated = await storage.updateOrder(id, order);
      res.json(updated);
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({ error: 'Error al actualizar el pedido' });
    }
  });

  app.delete("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteOrder(id);
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting order:', error);
      res.status(500).json({ error: 'Error al eliminar el pedido' });
    }
  });

  // Business Hours
  app.get("/api/business-hours", async (_req, res) => {
    try {
      const hours = await storage.getBusinessHours();
      res.json(hours);
    } catch (error) {
      console.error('Error getting business hours:', error);
      res.status(500).json({ error: 'Error al obtener el horario' });
    }
  });

  app.patch("/api/business-hours/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const hours = await storage.updateBusinessHours(id, req.body);
      res.json(hours);
    } catch (error) {
      console.error('Error updating business hours:', error);
      res.status(500).json({ error: 'Error al actualizar el horario' });
    }
  });

  // Generate and send invoice
  app.post("/api/orders/:id/invoice", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      const { customerEmail, customerPhone, customerDNI, customerAddress, totalAmount } = req.body;

      if (!order) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }

      // Get SMTP settings
      const smtpSettings = await storage.getSettingsByKeys([
        'smtp_host',
        'smtp_port',
        'smtp_user',
        'smtp_pass',
        'smtp_from'
      ]);

      // Create PDF
      const doc = new PDFDocument();
      const invoiceNumber = order.id.toString().padStart(6, '0');
      const pdfPath = path.join(process.cwd(), 'uploads', `factura-${invoiceNumber}.pdf`);
      await fs.ensureDir(path.dirname(pdfPath));

      // Pipe PDF to file
      doc.pipe(fs.createWriteStream(pdfPath));

      // Add logo
      doc.image(path.join(process.cwd(), 'client', 'public', 'img', 'corporativa', 'slogan-negro.png'), 50, 45, { width: 200 });

      // Add invoice details
      doc.fontSize(20).text(`Factura #${invoiceNumber}`, 50, 150);
      doc.fontSize(12).text(`Fecha: ${format(new Date(), "dd/MM/yyyy")}`, 50, 180);

      // Add customer details
      doc.fontSize(14).text('Datos del Cliente:', 50, 220);
      doc.fontSize(12)
        .text(`Nombre: ${order.customerName}`, 50, 250)
        .text(`DNI/NIF: ${customerDNI}`, 50, 270)
        .text(`Dirección: ${customerAddress}`, 50, 290)
        .text(`Teléfono: ${customerPhone}`, 50, 310)
        .text(`Email: ${customerEmail}`, 50, 330);

      // Add order details
      doc.fontSize(14).text('Detalles del Pedido:', 50, 370);
      doc.fontSize(12)
        .text(`Cantidad: ${order.quantity} pollos`, 50, 400)
        .text(`Fecha de recogida: ${format(new Date(order.pickupTime), "dd/MM/yyyy HH:mm")}`, 50, 420)
        .text(`Detalles: ${order.details || '-'}`, 50, 440);

      // Add total
      doc.fontSize(14).text(`Total (IVA incluido): ${totalAmount.toFixed(2)}€`, 50, 480);

      // Finalize PDF
      doc.end();

      // Update order with invoice details
      await storage.updateOrder(id, {
        customerEmail,
        customerPhone,
        customerDNI,
        customerAddress,
        totalAmount,
        invoicePDF: pdfPath,
        invoiceNumber
      });

      // Send email if SMTP is configured
      if (smtpSettings.smtp_host && customerEmail) {
        const transporter = nodemailer.createTransport({
          host: smtpSettings.smtp_host,
          port: parseInt(smtpSettings.smtp_port),
          secure: true,
          auth: {
            user: smtpSettings.smtp_user,
            pass: smtpSettings.smtp_pass
          }
        });

        await transporter.sendMail({
          from: smtpSettings.smtp_from,
          to: customerEmail,
          subject: `Factura #${invoiceNumber}`,
          text: `Adjunto encontrarás la factura de tu pedido.`,
          attachments: [{
            filename: `factura-${invoiceNumber}.pdf`,
            path: pdfPath
          }]
        });
      }

      // Send PDF to client
      res.sendFile(pdfPath);
    } catch (error) {
      console.error('Error generating invoice:', error);
      res.status(500).json({ error: 'Error al generar la factura' });
    }
  });

  // Get SMTP settings
  app.get("/api/settings/smtp", async (_req, res) => {
    try {
      const settings = await storage.getSettingsByKeys([
        'smtp_host',
        'smtp_port',
        'smtp_user',
        'smtp_pass',
        'smtp_from'
      ]);
      res.json(settings);
    } catch (error) {
      console.error('Error getting SMTP settings:', error);
      res.status(500).json({ error: 'Error al obtener la configuración SMTP' });
    }
  });

  // Update SMTP settings
  app.post("/api/settings/smtp", async (req, res) => {
    try {
      const { smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from } = req.body;

      await Promise.all([
        storage.updateSetting('smtp_host', smtp_host),
        storage.updateSetting('smtp_port', smtp_port),
        storage.updateSetting('smtp_user', smtp_user),
        storage.updateSetting('smtp_pass', smtp_pass),
        storage.updateSetting('smtp_from', smtp_from)
      ]);

      res.json({ message: 'Configuración SMTP actualizada' });
    } catch (error) {
      console.error('Error updating SMTP settings:', error);
      res.status(500).json({ error: 'Error al actualizar la configuración SMTP' });
    }
  });

  // Setup cron job for business hours scraping
  cron.schedule("59 23 * * *", async () => {
    try {
      const hours = await scrapeGoogleBusinessHours();
      // Update business hours in storage
      for (const hour of hours) {
        if (hour.autoUpdate) {
          await storage.updateBusinessHours(hour.id, hour);
        }
      }
    } catch (error) {
      console.error("Failed to scrape business hours:", error);
    }
  });

  // Stock History
  app.get("/api/stock/history", async (_req, res) => {
    try {
      const result = await db.select().from(stockHistory)
        .orderBy(desc(stockHistory.createdAt))
        .limit(100);
      res.json(result);
    } catch (error) {
      console.error('Error getting stock history:', error);
      res.status(500).json({ error: 'Error al obtener el historial de stock' });
    }
  });

  // Sales Analytics
  app.get("/api/analytics/sales", async (_req, res) => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await db.select({
        date: sql`DATE(${orders.createdAt})`,
        total: sql`SUM(${orders.totalAmount})`,
        count: sql`COUNT(*)`,
      })
      .from(orders)
      .where(
        and(
          sql`${orders.createdAt} >= ${thirtyDaysAgo}`,
          eq(orders.deleted, false)
        )
      )
      .groupBy(sql`DATE(${orders.createdAt})`);

      res.json(result);
    } catch (error) {
      console.error('Error getting sales analytics:', error);
      res.status(500).json({ error: 'Error al obtener análisis de ventas' });
    }
  });

  // Customer Analytics
  app.get("/api/analytics/customers", async (_req, res) => {
    try {
      const result = await db.select({
        customerName: orders.customerName,
        totalOrders: sql`COUNT(*)`,
        totalSpent: sql`SUM(${orders.totalAmount})`,
        avgOrderValue: sql`AVG(${orders.totalAmount})`,
      })
      .from(orders)
      .where(eq(orders.deleted, false))
      .groupBy(orders.customerName)
      .orderBy(sql`COUNT(*)`, "desc")
      .limit(10);

      res.json(result);
    } catch (error) {
      console.error('Error getting customer analytics:', error);
      res.status(500).json({ error: 'Error al obtener análisis de clientes' });
    }
  });

  // Product Performance
  app.get("/api/analytics/products", async (_req, res) => {
    try {
      const result = await db.select({
        categoryName: categories.name,
        productCount: sql`COUNT(DISTINCT ${products.id})`,
        avgPrice: sql`AVG(${products.price})`,
      })
      .from(categories)
      .leftJoin(products, eq(categories.id, products.categoryId))
      .where(
        and(
          eq(categories.deleted, false),
          eq(products.deleted, false)
        )
      )
      .groupBy(categories.name);

      res.json(result);
    } catch (error) {
      console.error('Error getting product analytics:', error);
      res.status(500).json({ error: 'Error al obtener análisis de productos' });
    }
  });


  // Settings routes
  app.get("/api/settings", async (_req, res) => {
    try {
      // Use SQL to get all settings since we don't have a getAll method
      const result = await db.select().from(settings);
      res.json(result);
    } catch (error) {
      console.error('Error getting settings:', error);
      res.status(500).json({ error: 'Error al obtener la configuración' });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const { key, value } = req.body;
      await storage.updateSetting(key, value);

      // Get the updated setting to return
      const result = await db.select().from(settings).where(eq(settings.key, key));
      res.json(result[0]);
    } catch (error) {
      console.error('Error creating setting:', error);
      res.status(500).json({ error: 'Error al crear la configuración' });
    }
  });

  app.patch("/api/settings/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      await storage.updateSetting(key, value);

      // Get the updated setting to return
      const result = await db.select().from(settings).where(eq(settings.key, key));
      res.json(result[0]);
    } catch (error) {
      console.error('Error updating setting:', error);
      res.status(500).json({ error: 'Error al actualizar la configuración' });
    }
  });

  app.delete("/api/settings/:key", async (req, res) => {
    try {
      const { key } = req.params;
      await db.delete(settings).where(eq(settings.key, key));
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting setting:', error);
      res.status(500).json({ error: 'Error al eliminar la configuración' });
    }
  });

  // Add default settings if they don't exist
  app.post("/api/settings/initialize", async (_req, res) => {
    try {
      const defaultSettings = [
        { key: 'smtp_host', value: 'smtp.gmail.com' },
        { key: 'smtp_port', value: '587' },
        { key: 'smtp_user', value: 'your-email@gmail.com' },
        { key: 'smtp_pass', value: 'your-app-password' },
        { key: 'smtp_from', value: 'Your Restaurant <your-email@gmail.com>' },
        { key: 'dias_abierto', value: '["V","S","D"]' },
        { key: 'horario_abertura', value: '10:00' },
        { key: 'horario_cerrar', value: '16:00' },
        { key: 'minimo_pedido', value: '1' },
        { key: 'maximo_pedido', value: '10' },
        { key: 'tiempo_preparacion', value: '30' }, // minutos
        { key: 'intervalo_recogida', value: '15' }, // minutos
      ];

      for (const setting of defaultSettings) {
        const existing = await storage.getSetting(setting.key);
        if (!existing) {
          await storage.updateSetting(setting.key, setting.value);
        }
      }

      res.json({ message: "Configuración inicial creada correctamente" });
    } catch (error) {
      console.error('Error initializing settings:', error);
      res.status(500).json({ error: 'Error al inicializar la configuración' });
    }
  });

  // Seeds Preview
  app.get("/api/admin/seeds/:type/preview", async (req, res) => {
    try {
      const { type } = req.params;
      const seedPath = path.join(process.cwd(), 'database', 'seeds', `${type}.json`);

      if (!await fs.pathExists(seedPath)) {
        return res.status(404).json({ error: 'Archivo de semilla no encontrado' });
      }

      const seedData = await fs.readJson(seedPath);
      return res.json({ 
        count: Array.isArray(seedData) ? seedData.length : 1,
        sample: Array.isArray(seedData) ? seedData[0] : seedData
      });
    } catch (error) {
      console.error('Error previewing seed:', error);
      res.status(500).json({ error: 'Error al obtener vista previa de la semilla' });
    }
  });

  // Seeds Execute
  app.post("/api/admin/seeds/:type/execute", async (req, res) => {
    try {
      const { type } = req.params;
      const seedPath = path.join(process.cwd(), 'database', 'seeds', `${type}.json`);

      if (!await fs.pathExists(seedPath)) {
        return res.status(404).json({ error: 'Archivo de semilla no encontrado' });
      }

      const seedData = await fs.readJson(seedPath);
      let count = 0;

      if (type === 'category') {
        for (const category of Array.isArray(seedData) ? seedData : [seedData]) {
          console.log('Procesando categoría:', category);
          // Buscar si existe una categoría con el mismo nombre
                    const existingCategories = await db.select().from(categories).where(eq(categories.name, category.name));

          if (existingCategories.length > 0) {
            console.log('Actualizando categoría existente:', existingCategories[0].id);
            await storage.updateCategory(existingCategories[0].id, category);
          } else {
            console.log('Creando nueva categoría');
            await storage.createCategory(category);
          }
          count++;
        }
      } else if (type === 'products'){
        for (const product of Array.isArray(seedData) ? seedData : [seedData]) {
          console.log('Procesando producto:', product);
          console.log('Estructura del producto:', {
            name: product.name,
            description: product.description,
            price: product.price,
            category_id: product.category_id
          });

          try {
            // Buscar si existe un producto con el mismo nombre
            const existingProducts = await db.select().from(products).where(eq(products.name, product.name));
            if (existingProducts.length > 0) {
              console.log('Actualizando producto existente:', existingProducts[0].id);
              await storage.updateProduct(existingProducts[0].id, {
                name: product.name,
                description: product.description,
                imageUrl: product.image,
                price: product.price,
                categoryId: product.category_id
              });
            } else {
              console.log('Creando nuevo producto');
              await storage.createProduct({
                name: product.name,
                description: product.description,
                imageUrl: product.image,
                price: product.price,
                categoryId: product.category_id
              });
            }
            count++;
            console.log('Producto procesado exitosamente');
          } catch (error) {
            console.error('Error al procesar producto:', error);
            throw error;
          }
        }
      }

      // Create backup with timestamp
      const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const backupPath = path.join(
        process.cwd(), 
        'database', 
        'seeds', 
        'backups',
        `${type}_${timestamp}.json`
      );

      await fs.ensureDir(path.dirname(backupPath));
      await fs.writeJson(backupPath, seedData, { spaces: 2 });

      res.json({ message: 'Semilla ejecutada correctamente', count });
    } catch (error) {
      console.error('Error executing seed:', error);
      res.status(500).json({ error: 'Error al ejecutar la semilla' });
    }
  });

  // Create directories if they don't exist
  app.post("/api/admin/seeds/initialize", async (_req, res) => {
    try {
      const dirs = [
        path.join(process.cwd(), 'database', 'seeds'),
        path.join(process.cwd(), 'database', 'seeds', 'backups')      
      ];

      for (const dir of dirs) {
        await fs.ensureDir(dir);
      }

      // Create initial seed files if they don't exist
      const seedFiles = {
        'category.json': [
          {
            name: "Menús",
            description: "Tenemos menús! Echa un vistazo y encárganos.",
            image: "categoria_menu.jpg"
          },
          {
            name: "Aperitivo",
            description: "Ojea todos nuestros aperitivos! Será por variedad...",
            image: "categoria_aperitivo.jpg"
          },
          {
            name: "Rustidera",
            description: "Tu Rustidera bajo encargo, mira lo que te ofrecemos.",
            image: "categoria_rustidera.jpg"
          }
        ],
        'products.json': [
          {
            name: "Kebab a Espada",
            description: "Receta Armenia que consiste en trozos de carne marinados ensartados en una espada y directos puestos a la brasa, servido en pan de la casa.",
            image: "brasa_kebab",
            price: 1500,
            category_id: 1
          },
          {
            name: "Medio Pollo Asado",
            description: "Medio pollo asado a la leña con nuestro toque especial",
            image: "medio_pollo",
            price: 800,
            category_id: 1
          },
          {
            name: "Patatas Bravas",
            description: "Patatas bravas caseras con nuestra salsa especial",
            image: "patatas_bravas",
            price: 500,
            category_id: 2
          },
          {
            name: "Rustidera Mixta",
            description: "Rustidera con variedad de carnes y verduras asadas",
            image: "rustidera_mixta",
            price: 2500,
            category_id: 3
          }
        ]
      };

      for (const [filename, data] of Object.entries(seedFiles)) {
        const filePath = path.join(process.cwd(), 'database', 'seeds', filename);
        await fs.writeJson(filePath, data, { spaces: 2 });
      }

      res.json({ message: 'Sistema de semillas inicializado correctamente' });
    } catch (error) {
      console.error('Error initializing seeds:', error);
      res.status(500).json({ error: 'Error al inicializar el sistema de semillas' });
    }
  });

  // List available seed files
  app.get("/api/admin/seeds/list", async (_req, res) => {
    try {
      const seedsDir = path.join(process.cwd(), 'database', 'seeds');
      const files = await fs.readdir(seedsDir);
      const jsonFiles = files
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));
      res.json(jsonFiles);
    } catch (error) {
      console.error('Error listing seed files:', error);
      res.status(500).json({ error: 'Error al listar archivos de semillas' });
    }
  });

  // Restore category
  app.post("/api/categories/:id/restore", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.update(categories)
        .set({ deleted: false })
        .where(eq(categories.id, id));
      res.json({ message: 'Categoría restaurada correctamente' });
    } catch (error) {
      console.error('Error restoring category:', error);
      res.status(500).json({ error: 'Error al restaurar la categoría' });
    }
  });

  // Restore product
  app.post("/api/products/:id/restore", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.update(products)
        .set({ deleted: false })
        .where(eq(products.id, id));
      res.json({ message: 'Producto restaurado correctamente' });
    } catch (error) {
      console.error('Error restoring product:', error);
      res.status(500).json({ error: 'Error al restaurar el producto' });
    }
  });

  // Create table dynamically
  app.post("/api/admin/tables", async (req, res) => {
    try {
      const { name, columns } = req.body;

      // Generar el SQL para crear la tabla
      const columnDefinitions = columns
        .map(col => `${col.name} ${col.type}`)
        .join(', ');

      const sql = `CREATE TABLE IF NOT EXISTS ${name} (
        id SERIAL PRIMARY KEY,
        ${columnDefinitions},
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted BOOLEAN DEFAULT FALSE
      )`;

      await db.execute(sql);

      res.json({ message: 'Tabla creada correctamente' });
    } catch (error) {
      console.error('Error creating table:', error);
      res.status(500).json({ error: 'Error al crear la tabla' });
    }
  });

  // Ruta para subir imagen de producto
  app.post("/api/products/:id/image", upload.single('image'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No se ha subido ningún archivo' });
      }

      await storage.updateProduct(id, {
        imageUrl: path.basename(file.path)
      });

      res.json({ message: 'Imagen actualizada correctamente' });
    } catch (error) {
      console.error('Error uploading product image:', error);
      res.status(500).json({ error: 'Error al subir la imagen del producto' });
    }
  });

  // Ruta para subir imagen de categoría
  app.post("/api/categories/:id/image", upload.single('image'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No se ha subido ningún archivo' });
      }

      await storage.updateCategory(id, {
        imageUrl: path.basename(file.path)
      });

      res.json({ message: 'Imagen actualizada correctamente' });
    } catch (error) {
      console.error('Error uploading category image:', error);
      res.status(500).json({ error: 'Error al subir la imagen de la categoría' });
    }
  });

  // Ruta para subir imagen durante la creación de producto
  app.post("/api/products/upload-image", upload.single('image'), async (req, res) => {
    try {
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'No se ha subido ningún archivo' });
      }

      res.json({ 
        filename: file.filename,
        message: 'Imagen subida correctamente'
      });
    } catch (error) {
      console.error('Error uploading product image:', error);
      res.status(500).json({ error: 'Error al subir la imagen del producto' });
    }
  });

  // Add new routes for Google Business hours synchronization
  app.get("/api/business-hours/sync", async (_req, res) => {
    try {
      const hours = await scrapeGoogleBusinessHours();

      // Update our database with the latest hours from Google
      for (const hour of hours) {
        await storage.updateBusinessHours(hour.id, hour);
      }

      res.json(hours);
    } catch (error) {
      console.error('Error syncing business hours:', error);
      res.status(500).json({ error: 'Error al sincronizar horarios con Google' });
    }
  });

  app.post("/api/business-hours/sync", async (req, res) => {
    try {
      const { hours } = req.body;
      await updateGoogleBusinessHours(hours);
      res.json({ message: 'Horarios sincronizados correctamente' });
    } catch (error) {
      console.error('Error updating Google business hours:', error);
      res.status(500).json({ error: 'Error al actualizar horarios en Google' });
    }
  });

  return httpServer;
}