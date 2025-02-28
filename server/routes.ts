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
      .reduce((total, order) => total + Number(order.quantity), 0);

    const currentStock = Number(stock?.currentStock || 0);

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
      currentStock: Number(currentStock?.currentStock || 0) + Number(quantity),
    };
    const result = await storage.updateStock(updatedStock);
    res.json(result);
  });

  app.post("/api/stock/remove", async (req, res) => {
    const { quantity } = req.body;
    const currentStock = await storage.getCurrentStock();
    const updatedStock = {
      ...currentStock,
      currentStock: Number(currentStock?.currentStock || 0) - Number(quantity),
    };
    const result = await storage.updateStock(updatedStock);
    res.json(result);
  });

  app.post("/api/stock/reset", async (_req, res) => {
    const today = new Date();
    const newStock = {
      date: today,
      initialStock: "0",
      currentStock: "0",
      unreservedStock: "0",
      reservedStock: "0",
    };
    const result = await storage.updateStock(newStock);
    res.json(result);
  });

  // Categories Routes
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

  // Products Routes
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

  // Orders Routes
  app.get("/api/orders", async (_req, res) => {
    const orders = await storage.getOrders();
    res.json(orders);
  });

  app.post("/api/orders", async (req, res) => {
    const order = insertOrderSchema.parse(req.body);
    const created = await storage.createOrder(order);
    res.json(created);
  });

  // Actualización de estado de pedidos
  app.patch("/api/orders/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const order = await storage.getOrder(id);

    if (!order) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    // Obtener el stock actual
    const currentStock = await storage.getCurrentStock();
    const stockQuantity = Number(currentStock?.currentStock || 0);
    const orderQuantity = Number(order.quantity);

    // Actualizar stock según el estado
    switch (status) {
      case "delivered":
        // Restar cantidad del stock actual
        await storage.updateStock({
          ...currentStock,
          currentStock: String(stockQuantity - orderQuantity)
        });
        break;
      case "error":
        // Si estaba pendiente, reintegrar al stock disponible
        if (order.status === "pending") {
          await storage.updateStock({
            ...currentStock,
            currentStock: String(stockQuantity + orderQuantity)
          });
        }
        break;
      case "cancelled":
        // No ajustar stock, solo marcar como cancelado
        break;
    }

    // Registrar en el log de stock si es necesario
    if (status === "delivered" || status === "error") {
      const stockLog = {
        date: new Date(),
        operation: status === "delivered" ? "order_delivered" : "order_error",
        quantity: orderQuantity,
        previousStock: stockQuantity,
        newStock: status === "delivered" ? stockQuantity - orderQuantity : stockQuantity + orderQuantity,
        orderId: order.id,
        notes: `Pedido ${id} marcado como ${status}`
      };
      await storage.createStockLog(stockLog);
    }

    // Actualizar el estado del pedido
    const updated = await storage.updateOrder(id, { ...order, status });
    res.json(updated);
  });

  app.delete("/api/orders/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const order = await storage.getOrder(id);

    if (!order) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    // Si el pedido estaba pendiente, reintegrar al stock
    if (order.status === "pending") {
      const currentStock = await storage.getCurrentStock();
      const stockQuantity = Number(currentStock?.currentStock || 0);
      const orderQuantity = Number(order.quantity);

      await storage.updateStock({
        ...currentStock,
        currentStock: String(stockQuantity + orderQuantity)
      });

      // Registrar en el log de stock
      const stockLog = {
        date: new Date(),
        operation: "order_cancelled",
        quantity: orderQuantity,
        previousStock: stockQuantity,
        newStock: stockQuantity + orderQuantity,
        orderId: order.id,
        notes: `Pedido ${id} eliminado`
      };
      await storage.createStockLog(stockLog);
    }

    await storage.deleteOrder(id);
    res.status(204).end();
  });

  // Business Hours Routes
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