import type { Express } from "express";
import { createServer, type Server } from "http";
import stockRoutes from './routes/stockRoutes';
import orderRoutes from './routes/orderRoutes';
import menuRoutes from './routes/menuRoutes';
import authRoutes from './routes/authRoutes';
import predictionsRoutes from './routes/predictionsRoutes';
import { storage } from "./storage";
import cron from "node-cron";
import { insertOrderSchema, insertProductSchema, insertCategorySchema, insertSettingsSchema } from "@shared/schema";
import { format } from "date-fns";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import fs from "fs-extra";
import path from "path";
import { db } from './db';
import { desc, sql, and, eq } from 'drizzle-orm';
import { stockHistory, orders, categories, products, settings } from '@shared/schema';
import multer from 'multer';
import { stockMiddleware, prepareStockUpdate } from './middleware/stockMiddleware';

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

// Configuración de multer para archivos de audio
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), 'temp', 'audio');
    // Ensure directory exists
    fs.ensureDirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const filename = `voice_${timestamp}.webm`;
    cb(null, filename);
  }
});

const upload = multer({ storage: multerStorage });
const uploadAudio = multer({ 
  storage: audioStorage,
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de audio'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Voice command processing function
function processVoiceCommand(transcription: string): { customerName: string; quantity: number; pickupTime: string; phone?: string } | null {
  try {
    const text = transcription.toLowerCase().trim();
    console.log('🔍 Processing voice command:', text);

    // Patterns for extracting information - Updated to capture full names with surnames
    const namePatterns = [
      // Pattern for "viene [Nombre Apellido]" - new pattern for this case
      /(?:viene|llega)\s+([a-záéíóúñ]+(?:\s+[a-záéíóúñ]+)*?)(?:\s*,|\s+\d|\s+un|\s+dos|\s+tres|\s+cuatro|\s+cinco|\s+medio)/i,
      // Patterns for "a nombre de [Nombre Apellido]", capturing full names including compound surnames
      /(?:a\s+nombre\s+de|para|de)\s+([a-záéíóúñ]+(?:\s+[a-záéíóúñ]+)*)/i,
      // Pattern for "nombre [Nombre Apellido]", capturing multiple words
      /(?:nombre|cliente)\s+([a-záéíóúñ]+(?:\s+[a-záéíóúñ]+)*)/i,
      // Pattern for "[Nombre Apellido] quiere/pide", capturing multiple words before action verbs
      /([a-záéíóúñ]+(?:\s+[a-záéíóúñ]+)*)\s+(?:quiere|pide)/i,
      // Pattern for simple "para [Nombre Apellido]", capturing multiple words
      /(?:para)\s+([a-záéíóúñ]+(?:\s+[a-záéíóúñ]+)*?)(?:\s*,|\s+\d|\s+un|\s+dos|\s+tres|\s+cuatro|\s+cinco)/i
    ];

    const quantityPatterns = [
      /(\d+)\s*(?:pollos?|pollo)/i,
      /(?:un|uno|1)\s*pollo/i,
      /(?:dos|2)\s*pollos?/i,
      /(?:tres|3)\s*pollos?/i,
      /(?:cuatro|4)\s*pollos?/i,
      /(?:cinco|5)\s*pollos?/i,
      /(?:medio|0\.?5)\s*pollo/i,
      /(un\s+pollo\s+y\s+medio|1\.?5)\s*pollos?/i
    ];

    const timePatterns = [
      // Patterns for "X de la tarde/mañana/noche" - high priority patterns
      /(?:para\s+las?\s+|a\s+las?\s+)?(\d{1,2})\s+de\s+la\s+tarde/i,
      /(?:para\s+las?\s+|a\s+las?\s+)?(\d{1,2})\s+de\s+la\s+mañana/i,
      /(?:para\s+las?\s+|a\s+las?\s+)?(\d{1,2})\s+de\s+la\s+noche/i,
      // Patterns for "tres y media", "dos y media", etc.
      /(?:para\s+las?\s+|a\s+las?\s+)?(una?\s+y\s+media)/i,
      /(?:para\s+las?\s+|a\s+las?\s+)?(dos\s+y\s+media)/i,
      /(?:para\s+las?\s+|a\s+las?\s+)?(tres\s+y\s+media)/i,
      /(?:para\s+las?\s+|a\s+las?\s+)?(cuatro\s+y\s+media)/i,
      /(?:para\s+las?\s+|a\s+las?\s+)?(cinco\s+y\s+media)/i,
      /(?:para\s+las?\s+|a\s+las?\s+)?(seis\s+y\s+media)/i,
      /(?:para\s+las?\s+|a\s+las?\s+)?(siete\s+y\s+media)/i,
      /(?:para\s+las?\s+|a\s+las?\s+)?(ocho\s+y\s+media)/i,
      /(?:para\s+las?\s+|a\s+las?\s+)?(nueve\s+y\s+media)/i,
      /(?:para\s+las?\s+|a\s+las?\s+)?(diez\s+y\s+media)/i,
      /(?:para\s+las?\s+|a\s+las?\s+)?(once\s+y\s+media)/i,
      /(?:para\s+las?\s+|a\s+las?\s+)?(doce\s+y\s+media)/i,
      // Patterns for spelled out hours: "una", "dos", "tres", etc.
      /(?:para\s+las?\s+|a\s+las?\s+)?(una?)\s*(?:horas?|h)?/i,
      /(?:para\s+las?\s+|a\s+las?\s+)?(dos)\s*(?:horas?|h)?/i,
      /(?:para\s+las?\s+|a\s+las?\s+)?(tres)\s*(?:horas?|h)?/i,
      /(?:para\s+las?\s+|a\s+las?\s+)?(cuatro)\s*(?:horas?|h)?/i,
      /(?:para\s+las?\s+|a\s+las?\s+)?(cinco)\s*(?:horas?|h)?/i,
      /(?:para\s+las?\s+|a\s+las?\s+)?(seis)\s*(?:horas?|h)?/i,
      /(?:para\s+las?\s+|a\s+las?\s+)?(siete)\s*(?:horas?|h)?/i,
      /(?:para\s+las?\s+|a\s+las?\s+)?(ocho)\s*(?:horas?|h)?/i,
      /(?:para\s+las?\s+|a\s+las?\s+)?(nueve)\s*(?:horas?|h)?/i,
      /(?:para\s+las?\s+|a\s+las?\s+)?(diez)\s*(?:horas?|h)?/i,
      /(?:para\s+las?\s+|a\s+las?\s+)?(once)\s*(?:horas?|h)?/i,
      /(?:para\s+las?\s+|a\s+las?\s+)?(doce)\s*(?:horas?|h)?/i,
      // Original numeric patterns
      /(?:para\s+las?\s+|a\s+las?\s+)(\d{1,2}(?::\d{2})?)/i,
      /(\d{1,2}(?::\d{2})?)\s*(?:horas?|h)/i,
      /(?:las?\s+)(\d{1,2}(?::\d{2})?)/i
    ];

    const phonePatterns = [
      /(?:teléfono|móvil|número)\s*(?:es\s*)?(\d{9})/i,
      /(\d{9})/i
    ];

    // Helper function to properly capitalize full names
    const capitalizeName = (name: string): string => {
      return name.trim()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };

    // Extract customer name
    let customerName = '';
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        customerName = capitalizeName(match[1]);
        break;
      }
    }

    // Extract quantity
    let quantity = 1; // Default to 1 chicken
    for (const pattern of quantityPatterns) {
      const match = text.match(pattern);
      if (match) {
        if (pattern.source.includes('medio|0\\.?5')) {
          quantity = 0.5;
        } else if (pattern.source.includes('un\\s+pollo\\s+y\\s+medio|1\\.?5')) {
          quantity = 1.5;
        } else if (match[1]) {
          const num = parseFloat(match[1]);
          if (!isNaN(num)) quantity = num;
        } else if (pattern.source.includes('un|uno|1')) {
          quantity = 1;
        } else if (pattern.source.includes('dos|2')) {
          quantity = 2;
        } else if (pattern.source.includes('tres|3')) {
          quantity = 3;
        } else if (pattern.source.includes('cuatro|4')) {
          quantity = 4;
        } else if (pattern.source.includes('cinco|5')) {
          quantity = 5;
        }
        break;
      }
    }

    // Helper function to convert Spanish time words to numbers
    const convertSpanishTimeToNumber = (timeStr: string): string => {
      const normalizedTime = timeStr.toLowerCase().trim();
      
      // Check for "X de la tarde/mañana/noche" patterns first
      const tardeMatch = normalizedTime.match(/(\d{1,2})\s+de\s+la\s+tarde/);
      if (tardeMatch) {
        const hour = parseInt(tardeMatch[1]);
        // Convert to 24-hour format for afternoon (12-11 PM becomes 12-23)
        const convertedHour = hour === 12 ? 12 : hour + 12;
        return `${convertedHour.toString().padStart(2, '0')}:00`;
      }
      
      const mananaMatch = normalizedTime.match(/(\d{1,2})\s+de\s+la\s+mañana/);
      if (mananaMatch) {
        const hour = parseInt(mananaMatch[1]);
        // Morning hours stay the same (but 12 AM becomes 00)
        const convertedHour = hour === 12 ? 0 : hour;
        return `${convertedHour.toString().padStart(2, '0')}:00`;
      }
      
      const nocheMatch = normalizedTime.match(/(\d{1,2})\s+de\s+la\s+noche/);
      if (nocheMatch) {
        const hour = parseInt(nocheMatch[1]);
        // Night hours (6 PM - 11 PM becomes 18-23)
        const convertedHour = hour + 12;
        return `${convertedHour.toString().padStart(2, '0')}:00`;
      }
      
      // Fallback to word-based time mapping
      const timeMap: { [key: string]: string } = {
        'una y media': '13:30',
        'dos y media': '14:30', 
        'tres y media': '15:30',
        'cuatro y media': '16:30',
        'cinco y media': '17:30',
        'seis y media': '18:30',
        'siete y media': '19:30',
        'ocho y media': '20:30',
        'nueve y media': '21:30',
        'diez y media': '10:30',
        'once y media': '11:30',
        'doce y media': '12:30',
        'una': '13:00',
        'dos': '14:00',
        'tres': '15:00',
        'cuatro': '16:00',
        'cinco': '17:00',
        'seis': '18:00',
        'siete': '19:00',
        'ocho': '20:00',
        'nueve': '21:00',
        'diez': '10:00',
        'once': '11:00',
        'doce': '12:00'
      };
      
      return timeMap[normalizedTime] || timeStr;
    };

    // Extract pickup time
    let pickupTime = '';
    for (const pattern of timePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        let time = match[1];
        
        // For "X de la tarde/mañana/noche" patterns, pass the full match to converter
        if (pattern.source.includes('de\\s+la\\s+')) {
          time = convertSpanishTimeToNumber(match[0]);
        } else {
          // Convert Spanish time expressions to numeric format
          time = convertSpanishTimeToNumber(time);
        }
        
        // Add :00 if no minutes specified and it's numeric
        if (!time.includes(':') && /^\d+$/.test(time)) {
          time += ':00';
        }
        
        // Ensure time is in HH:MM format
        const timeParts = time.split(':');
        if (timeParts.length === 2) {
          const hours = parseInt(timeParts[0]);
          const minutes = parseInt(timeParts[1]);
          if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
            pickupTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          }
        }
        break;
      }
    }

    // Extract phone number
    let phone = '';
    for (const pattern of phonePatterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[1].length === 9) {
        phone = match[1];
        break;
      }
    }

    // Default pickup time if not specified (1 hour from now)
    if (!pickupTime) {
      const now = new Date();
      now.setHours(now.getHours() + 1);
      pickupTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    }

    // Return data only if we have at least a name and a reasonable quantity
    if (customerName && quantity > 0) {
      return {
        customerName,
        quantity,
        pickupTime,
        phone
      };
    }

    return null;
  } catch (error) {
    console.error('❌ Error processing voice command:', error);
    return null;
  }
}

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

  // Endpoint optimizado que combina orders y stock para mejor rendimiento
  app.get("/api/dashboard-data", async (req, res) => {
    try {
      console.log('🔄 Obteniendo datos combinados del dashboard...');
      
      // Obtener ambos conjuntos de datos en paralelo
      const [ordersData, stockData] = await Promise.all([
        storage.getOrders(),
        storage.getCurrentStock()
      ]);

      console.log(`📊 Dashboard data - Orders: ${ordersData?.length || 0}, Stock disponible: ${stockData ? 'Sí' : 'No'}`);

      res.json({
        orders: ordersData || [],
        stock: stockData || null,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error obteniendo datos del dashboard:', error);
      res.status(500).json({ 
        error: "Error al obtener datos del dashboard",
        details: error instanceof Error ? error.message : "Error desconocido"
      });
    }
  });

  // Register routes
  app.use('/api/stock', stockRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/menus', menuRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/predictions', predictionsRoutes);


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
      const productUpdate = req.body;
      const updated = await storage.updateProduct(id, productUpdate);
      res.json(updated);
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Error al actualizar el producto' });
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
  
  // Inicializar configuraciones básicas si no existen
  app.post("/api/settings/initialize", async (_req, res) => {
    try {
      // Claves de configuración para menús destacados
      const FEATURED_MENU_1 = "featured_menu_1";
      const FEATURED_MENU_2 = "featured_menu_2";
      const FEATURED_MENU_3 = "featured_menu_3";
      
      // Verificar cada clave individualmente
      const settings1 = await db.select()
        .from(settings)
        .where(eq(settings.key, FEATURED_MENU_1));
      
      const settings2 = await db.select()
        .from(settings)
        .where(eq(settings.key, FEATURED_MENU_2));
        
      const settings3 = await db.select()
        .from(settings)
        .where(eq(settings.key, FEATURED_MENU_3));
      
      // Crear lista de configuraciones existentes
      const existingSettings = [
        ...settings1,
        ...settings2,
        ...settings3
      ];
      
      const missingKeys = [
        FEATURED_MENU_1,
        FEATURED_MENU_2,
        FEATURED_MENU_3
      ].filter(key => !existingSettings.some(s => s.key === key));
      
      // Insertar configuraciones faltantes una por una
      for (const key of missingKeys) {
        await db.insert(settings).values({
          key,
          value: "0" // Valor por defecto (ningún menú seleccionado)
        });
      }
      
      // Agregar también las configuraciones básicas del sistema
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
      
      res.json({ 
        message: "Configuración inicializada correctamente", 
        initializedSettings: missingKeys 
      });
    } catch (error) {
      console.error('Error initializing settings:', error);
      res.status(500).json({ error: 'Error al inicializar la configuración' });
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

  // Esta ruta de configuración ha sido reemplazada por la versión anterior, ya no es necesaria

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
      } else if (type === 'products') {
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

  // Database Administration Routes
  app.get("/api/admin/database/tables", async (_req, res) => {
    try {
      const result = await db.execute(sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        AND table_name NOT IN ('pg_stat_statements')
        ORDER BY table_name;
      `);

      console.log('Tables found:', result.rows);
      res.json(result.rows.map(row => row.table_name));
    } catch (error) {
      console.error('Error getting tables:', error);
      res.status(500).json({ error: 'Error al obtener las tablas' });
    }
  });

  app.get("/api/admin/database/table/:name", async (req, res) => {
    try {
      const tableName = req.params.name;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      // Validate table name exists
      const tableExists = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = ${tableName}
        )
      `);

      if (!tableExists.rows[0].exists) {
        return res.status(404).json({ error: 'Tabla no encontrada' });
      }

      // Get total count
      const countResult = await db.execute(sql`
        SELECT COUNT(*) as total FROM ${sql.identifier(tableName)}
      `);
      const total = parseInt(countResult.rows[0].total);

      // Get paginated data
      const result = await db.execute(sql`
        SELECT * FROM ${sql.identifier(tableName)}
        ORDER BY id DESC
        LIMIT ${limit} OFFSET ${offset}
      `);

      res.json({
        data: result.rows,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error getting table data:', error);
      res.status(500).json({ error: 'Error al obtener los datos de la tabla' });
    }
  });

  app.post("/api/admin/database/export", async (_req, res) => {
    try {
      // Create exports directory if it doesn't exist
      const exportsDir = path.join(process.cwd(), 'database', 'exports');
      await fs.ensureDir(exportsDir);

      const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
      const filename = `dump_${timestamp}.sql`;
      const filePath = path.join(exportsDir, filename);

      // Use pg_dump to create a complete database backup
      const { DATABASE_URL } = process.env;
      if (!DATABASE_URL) {
        throw new Error('DATABASE_URL not found');
      }

      const { execSync } = require('child_process');
      execSync(`pg_dump "${DATABASE_URL}" > "${filePath}"`);

      // Optional: Create a gzip version
      execSync(`gzip -c "${filePath}" > "${filePath}.gz"`);

      // Send the file
      res.download(filePath, filename);
    } catch (error) {
      console.error('Error exporting database:', error);
      res.status(500).json({ error: 'Error al exportar la base de datos' });
    }
  });

  app.post("/api/admin/database/import", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se ha proporcionado ningún archivo' });
      }

      const { DATABASE_URL } = process.env;
      if (!DATABASE_URL) {
        throw new Error('DATABASE_URL not found');
      }

      // Create a backup before import
      const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
      const backupDir = path.join(process.cwd(), 'database', 'backups');
      await fs.ensureDir(backupDir);
      const backupPath = path.join(backupDir, `backup_before_import_${timestamp}.sql`);

      const { execSync } = require('child_process');
      execSync(`pg_dump "${DATABASE_URL}" > "${backupPath}"`);

      // Import the new file
      execSync(`psql "${DATABASE_URL}" < "${req.file.path}"`);

      res.json({ message: 'Base de datos importada correctamente' });
    } catch (error) {
      console.error('Error importing database:', error);
      res.status(500).json({ error: 'Error al importar la base de datos' });
    }
  });

  // API para verificar si una imagen existe
  app.get('/api/file-exists', async (req, res) => {
    const filePath = req.query.path;
    if (!filePath || typeof filePath !== 'string') {
      return res.status(400).json({ exists: false, error: 'No path provided' });
    }
    
    try {
      // Normalizar la ruta para evitar acceso a directorios superiores
      const normalizedPath = filePath.replace(/\.\./g, '');
      // Construir ruta completa
      const fullPath = path.join(process.cwd(), 'client', 'public', normalizedPath);
      
      // Verificar existencia del archivo
      const exists = await fs.pathExists(fullPath);
      res.status(200).json({ exists });
    } catch (error: any) {
      console.error(`Error al verificar archivo: ${error.message}`);
      res.status(500).json({ exists: false, error: `Error al verificar archivo: ${error.message}` });
    }
  });

  // Speech-to-Text endpoint for voice recognition
  app.post('/api/speech-to-text', uploadAudio.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se proporcionó archivo de audio' });
      }

      console.log('🎤 Processing voice audio file:', req.file.filename);

      // Extract OpenAI API key from environment
      const openaiKey = process.env.OPENAI_PLATFORM || process.env.OPENAI_API_KEY;
      
      console.log('🔑 Checking OpenAI keys:');
      console.log('  OPENAI_PLATFORM exists:', !!process.env.OPENAI_PLATFORM);
      console.log('  OPENAI_PLATFORM value length:', process.env.OPENAI_PLATFORM?.length || 0);
      console.log('  OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
      console.log('  All env keys that start with OPENAI:', Object.keys(process.env).filter(k => k.startsWith('OPENAI')));
      console.log('  Selected key starts with:', openaiKey ? openaiKey.substring(0, 10) + '...' : 'null');
      
      if (!openaiKey) {
        console.error('❌ OpenAI API key not found');
        return res.status(500).json({ error: 'Clave API de OpenAI no configurada' });
      }

      // Import OpenAI and FormData (ES modules)
      const { default: OpenAI } = await import('openai');
      const { default: FormData } = await import('form-data');
      
      const openai = new OpenAI({
        apiKey: openaiKey
      });

      // Create FormData and append the audio file
      const form = new FormData();
      form.append('file', fs.createReadStream(req.file.path), {
        filename: req.file.filename,
        contentType: req.file.mimetype
      });
      form.append('model', 'whisper-1');
      form.append('language', 'es'); // Spanish language
      form.append('response_format', 'text');

      // Call OpenAI Whisper API
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(req.file.path),
        model: 'whisper-1',
        language: 'es',
        response_format: 'text'
      });

      console.log('🗣️ Transcription result:', transcription);

      // Clean up uploaded file
      await fs.remove(req.file.path);

      // Process the transcribed text for order creation
      const orderData = processVoiceCommand(transcription);

      if (orderData) {
        console.log('✅ Order data extracted:', orderData);
        
        // Create the order if we have valid data
        try {
          const newOrder = await storage.createOrder({
            customerName: orderData.customerName,
            phone: orderData.phone || '',
            quantity: orderData.quantity,
            pickupTime: orderData.pickupTime,
            items: JSON.stringify([{
              id: 1, // Default product ID for chicken
              name: 'Pollo Asado',
              quantity: orderData.quantity,
              price: 800 // Default price per chicken
            }]),
            totalAmount: orderData.quantity * 800,
            status: 'pending',
            notes: `Pedido creado por voz: "${transcription}"`
          });

          res.json({
            success: true,
            transcription,
            orderCreated: true,
            order: newOrder,
            extractedData: orderData
          });
        } catch (orderError) {
          console.error('❌ Error creating order:', orderError);
          res.json({
            success: true,
            transcription,
            orderCreated: false,
            error: 'Error al crear el pedido',
            extractedData: orderData
          });
        }
      } else {
        res.json({
          success: true,
          transcription,
          orderCreated: false,
          message: 'No se pudo extraer información del pedido del texto'
        });
      }

    } catch (error) {
      console.error('❌ Speech-to-text error:', error);
      
      // Clean up file if it exists
      if (req.file?.path) {
        try {
          await fs.remove(req.file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }
      }
      
      res.status(500).json({ 
        error: 'Error procesando el audio. Inténtalo de nuevo.',
        details: error.message 
      });
    }
  });

  return httpServer;
}