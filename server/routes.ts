import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import cron from "node-cron";
import { insertOrderSchema, insertProductSchema, insertCategorySchema } from "@shared/schema";
import { scrapeGoogleBusinessHours } from "./scraper";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Stock Management Routes
  app.get("/api/stock", async (_req, res) => {
    const stock = await storage.getCurrentStock();
    const orders = await storage.getOrders();

    // Calcular el stock reservado basado en los pedidos pendientes
    const reservedStock = orders
      .filter(order => order.status === "pending")
      .reduce((total, order) => total + parseFloat(order.quantity.toString()), 0);

    const currentStock = parseFloat((stock?.currentStock || 0).toString());

    const response = {
      ...stock,
      reservedStock,
      unreservedStock: currentStock - reservedStock,
    };

    res.json(response);
  });

  app.post("/api/stock/add", async (req, res) => {
    const { quantity } = req.body;
    const currentStock = await storage.getCurrentStock();
    const updatedStock = {
      ...currentStock,
      currentStock: parseFloat((currentStock?.currentStock || 0).toString()) + parseFloat(quantity),
    };
    const result = await storage.updateStock(updatedStock);
    res.json(result);
  });

  app.post("/api/stock/remove", async (req, res) => {
    const { quantity } = req.body;
    const currentStock = await storage.getCurrentStock();
    const updatedStock = {
      ...currentStock,
      currentStock: parseFloat((currentStock?.currentStock || 0).toString()) - parseFloat(quantity),
    };
    const result = await storage.updateStock(updatedStock);
    res.json(result);
  });

  app.post("/api/stock/sell", async (req, res) => {
    const { quantity } = req.body;
    const currentStock = await storage.getCurrentStock();
    const updatedStock = {
      ...currentStock,
      currentStock: parseFloat((currentStock?.currentStock || 0).toString()) - parseFloat(quantity),
    };
    const result = await storage.updateStock(updatedStock);
    res.json(result);
  });

  app.post("/api/stock/reset", async (_req, res) => {
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
  });

  // Admin routes for database management
  app.post("/api/admin/run-migrations", async (_req, res) => {
    try {
      // Execute migrations
      await db.push();
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
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.post("/api/categories", async (req, res) => {
    const category = insertCategorySchema.parse(req.body);
    const created = await storage.createCategory(category);
    res.json(created);
  });

  app.patch("/api/categories/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const category = insertCategorySchema.partial().parse(req.body);
    const updated = await storage.updateCategory(id, category);
    res.json(updated);
  });

  app.delete("/api/categories/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteCategory(id);
    res.status(204).end();
  });

  // Products
  app.get("/api/products", async (req, res) => {
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
    const products = await storage.getProducts(categoryId);
    res.json(products);
  });

  app.post("/api/products", async (req, res) => {
    const product = insertProductSchema.parse(req.body);
    const created = await storage.createProduct(product);
    res.json(created);
  });

  app.patch("/api/products/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const product = insertProductSchema.partial().parse(req.body);
    const updated = await storage.updateProduct(id, product);
    res.json(updated);
  });

  app.delete("/api/products/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteProduct(id);
    res.status(204).end();
  });

  // Orders
  app.get("/api/orders", async (_req, res) => {
    const orders = await storage.getOrders();
    res.json(orders);
  });

  app.post("/api/orders", async (req, res) => {
    const order = insertOrderSchema.parse(req.body);
    const created = await storage.createOrder(order);
    res.json(created);
  });

  app.patch("/api/orders/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const order = insertOrderSchema.partial().parse(req.body);
    const updated = await storage.updateOrder(id, order);
    res.json(updated);
  });

  app.delete("/api/orders/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteOrder(id);
    res.status(204).end();
  });

  // Business Hours
  app.get("/api/business-hours", async (_req, res) => {
    const hours = await storage.getBusinessHours();
    res.json(hours);
  });

  app.patch("/api/business-hours/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const hours = await storage.updateBusinessHours(id, req.body);
    res.json(hours);
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