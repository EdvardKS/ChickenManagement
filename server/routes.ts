import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import cron from "node-cron";
import { insertOrderSchema, insertProductSchema, insertCategorySchema } from "@shared/schema";
import { scrapeGoogleBusinessHours } from "./scraper";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

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

  // Stock
  app.get("/api/stock", async (_req, res) => {
    const stock = await storage.getCurrentStock();
    res.json(stock);
  });

  app.patch("/api/stock", async (req, res) => {
    const stock = await storage.updateStock(req.body);
    res.json(stock);
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
