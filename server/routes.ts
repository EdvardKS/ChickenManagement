import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import cron from "node-cron";
import { insertOrderSchema, insertProductSchema, insertCategorySchema } from "@shared/schema";
import { scrapeGoogleBusinessHours } from "./scraper";
import { format } from "date-fns";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import fs from "fs-extra";
import path from "path";

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

  app.post("/api/stock/add", async (req, res) => {
    try {
      const { quantity } = req.body;
      console.log('Adding stock quantity:', quantity);

      const currentStock = await storage.getCurrentStock();
      console.log('Current stock before update:', currentStock);

      const newStock = currentStock || {
        date: new Date(),
        initialStock: "0",
        currentStock: "0",
        reservedStock: "0",
        unreservedStock: "0"
      };

      const updatedStock = {
        ...newStock,
        initialStock: currentStock ? newStock.initialStock : quantity.toString(),
        currentStock: (parseFloat((newStock.currentStock || "0")) + parseFloat(quantity)).toString(),
      };

      console.log('Updating stock with:', updatedStock);
      const result = await storage.updateStock(updatedStock);
      console.log('Stock update result:', result);

      // Registrar en el historial
      await storage.createStockHistory({
        stockId: result.id,
        action: 'add',
        quantity: quantity.toString(),
        previousStock: newStock.currentStock,
        newStock: result.currentStock,
        createdBy: 'system'
      });

      res.json(result);
    } catch (error) {
      console.error('Error adding stock:', error);
      res.status(500).json({ error: 'Error al añadir stock' });
    }
  });

  // Confirmar pedido
  app.patch("/api/orders/:id/confirm", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);

      if (!order) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }

      // Actualizar el pedido
      const updatedOrder = await storage.updateOrder(id, {
        status: "completed",
        updatedAt: new Date()
      });

      // Actualizar el stock
      const currentStock = await storage.getCurrentStock();
      if (currentStock) {
        await storage.updateStock({
          ...currentStock,
          currentStock: parseFloat(currentStock.currentStock.toString()) - parseFloat(order.quantity.toString()),
        });
      }

      res.json(updatedOrder);
    } catch (error) {
      console.error('Error confirming order:', error);
      res.status(500).json({ error: 'Error al confirmar el pedido' });
    }
  });

  // Marcar pedido como error
  app.patch("/api/orders/:id/error", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);

      if (!order) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }

      // Marcar como eliminado y error
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

  app.post("/api/stock/remove", async (req, res) => {
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

  app.post("/api/stock/reset", async (_req, res) => {
    try {
      const today = new Date();
      const newStock = {
        date: today,
        initialStock: 0,
        currentStock: 0,
        unreservedStock: 0,
        reservedStock: 0,
      };
      const result = await storage.updateStock(newStock);
      res.json(result);
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
      await storage.deleteCategory(id);
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
      await storage.deleteProduct(id);
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

  return httpServer;
}