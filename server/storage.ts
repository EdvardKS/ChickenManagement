import {
  type Category, type InsertCategory,
  type Product, type InsertProduct,
  type Order, type InsertOrder,
  type Stock, type InsertStock,
  type BusinessHours, type InsertBusinessHours,
  type StockHistory, type InsertStockHistory,
  categories, products, orders, stock, stockHistory, orderLogs, businessHours, settings
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, isNull, sql } from "drizzle-orm";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;

  // Products
  getProducts(categoryId?: number): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<Order>): Promise<Order>;
  deleteOrder(id: number): Promise<void>;

  // Stock
  getCurrentStock(): Promise<Stock | undefined>;
  updateStock(stock: Partial<Stock>): Promise<Stock>;
  createStockHistory(history: InsertStockHistory): Promise<StockHistory>;

  // Business Hours
  getBusinessHours(): Promise<BusinessHours[]>;
  createBusinessHours(hours: InsertBusinessHours): Promise<BusinessHours>;
  updateBusinessHours(id: number, hours: Partial<InsertBusinessHours>): Promise<BusinessHours>;

  // Settings
  getSetting(key: string): Promise<string | null>;
  getSettingsByKeys(keys: string[]): Promise<Record<string, string>>;
  updateSetting(key: string, value: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.deleted, false));
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category> {
    const [updated] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return updated;
  }

  async deleteCategory(id: number): Promise<void> {
    await db
      .update(categories)
      .set({ deleted: true })
      .where(eq(categories.id, id));
  }

  // Products
  async getProducts(categoryId?: number): Promise<Product[]> {
    let query = db.select().from(products).where(eq(products.deleted, false));
    if (categoryId) {
      query = query.where(eq(products.categoryId, categoryId));
    }
    return await query;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const [updated] = await db
      .update(products)
      .set(product)
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    await db
      .update(products)
      .set({ deleted: true })
      .where(eq(products.id, id));
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .orderBy(orders.pickupTime)
      .where(eq(orders.deleted, false));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const now = new Date();
    const [newOrder] = await db
      .insert(orders)
      .values({
        ...order,
        status: 'pending',
        createdAt: now,
        updatedAt: now
      })
      .returning();

    // Registrar en el log
    await db.insert(orderLogs).values({
      orderId: newOrder.id,
      action: 'create',
      newState: JSON.stringify(newOrder),
      createdBy: 'system'
    });

    return newOrder;
  }

  async updateOrder(id: number, orderData: Partial<Order>): Promise<Order> {
    const oldOrder = await this.getOrder(id);
    const now = new Date();

    const [updated] = await db
      .update(orders)
      .set({ ...orderData, updatedAt: now })
      .where(eq(orders.id, id))
      .returning();

    // Registrar en el log
    await db.insert(orderLogs).values({
      orderId: id,
      action: 'update',
      previousState: JSON.stringify(oldOrder),
      newState: JSON.stringify(updated),
      createdBy: 'system'
    });

    return updated;
  }

  async deleteOrder(id: number): Promise<void> {
    const oldOrder = await this.getOrder(id);

    await db
      .update(orders)
      .set({ deleted: true, updatedAt: new Date() })
      .where(eq(orders.id, id));

    // Registrar en el log
    await db.insert(orderLogs).values({
      orderId: id,
      action: 'delete',
      previousState: JSON.stringify(oldOrder),
      createdBy: 'system'
    });
  }

  // Stock
  async getCurrentStock(): Promise<Stock | undefined> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [currentStock] = await db
      .select()
      .from(stock)
      .where(eq(stock.date, today))
      .orderBy(desc(stock.lastUpdated))
      .limit(1);

    if (!currentStock) {
      console.log('No stock found for today, creating initial stock');
      const [newStock] = await db
        .insert(stock)
        .values({
          date: today,
          initialStock: "0",
          currentStock: "0",
          reservedStock: "0",
          unreservedStock: "0",
          lastUpdated: new Date()
        })
        .returning();
      return newStock;
    }

    return currentStock;
  }

  async updateStock(stockData: Partial<Stock>): Promise<Stock> {
    console.log('Updating stock with data:', stockData);
    const currentStock = await this.getCurrentStock();
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Asegurar que todos los campos se conviertan a string
    const updatedValues = {
      initialStock: String(stockData.initialStock || currentStock?.initialStock || 0),
      currentStock: String(stockData.currentStock || currentStock?.currentStock || 0),
      reservedStock: String(stockData.reservedStock || currentStock?.reservedStock || 0),
      unreservedStock: String(
        parseFloat(String(stockData.currentStock || currentStock?.currentStock || 0)) -
        parseFloat(String(stockData.reservedStock || currentStock?.reservedStock || 0))
      ),
      lastUpdated: new Date()
    };

    console.log('Calculated updated values:', updatedValues);

    let updatedStock: Stock;
    if (!currentStock) {
      console.log('Creating new stock entry');
      const [newStock] = await db
        .insert(stock)
        .values({
          date: now,
          ...updatedValues
        })
        .returning();
      updatedStock = newStock;
    } else {
      console.log('Updating existing stock:', currentStock.id);
      const [updated] = await db
        .update(stock)
        .set(updatedValues)
        .where(eq(stock.id, currentStock.id))
        .returning();
      updatedStock = updated;
    }

    // Crear entrada en el historial
    await this.createStockHistory({
      stockId: updatedStock.id,
      action: "update",
      quantity: parseFloat(updatedValues.currentStock) - parseFloat(currentStock?.currentStock || "0"),
      previousStock: parseFloat(currentStock?.currentStock || "0"),
      newStock: parseFloat(updatedValues.currentStock),
      createdBy: "system"
    });

    console.log('Stock update result:', updatedStock);
    return updatedStock;
  }

  async createStockHistory(history: InsertStockHistory): Promise<StockHistory> {
    console.log('Creating stock history:', history);
    const [newHistory] = await db
      .insert(stockHistory)
      .values({
        ...history,
        createdAt: new Date()
      })
      .returning();
    console.log('Created stock history:', newHistory);
    return newHistory;
  }

  // Business Hours
  async getBusinessHours(): Promise<BusinessHours[]> {
    return await db.select().from(businessHours);
  }

  async createBusinessHours(hours: InsertBusinessHours): Promise<BusinessHours> {
    const [newHours] = await db
      .insert(businessHours)
      .values(hours)
      .returning();
    return newHours;
  }

  async updateBusinessHours(id: number, hours: Partial<InsertBusinessHours>): Promise<BusinessHours> {
    const [updated] = await db
      .update(businessHours)
      .set(hours)
      .where(eq(businessHours.id, id))
      .returning();
    return updated;
  }

  // Settings
  async getSetting(key: string): Promise<string | null> {
    const [setting] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key));
    return setting?.value || null;
  }

  async getSettingsByKeys(keys: string[]): Promise<Record<string, string>> {
    const settingsData = await db
      .select()
      .from(settings)
      .where(
        eq(settings.key, keys[0]) // Start with first key
      )
      .where(
        keys.slice(1).map(key => eq(settings.key, key)) // Add OR conditions for remaining keys
      );

    return settingsData.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);
  }

  async updateSetting(key: string, value: string): Promise<void> {
    const existing = await this.getSetting(key);

    if (existing === null) {
      await db.insert(settings).values({ key, value });
    } else {
      await db
        .update(settings)
        .set({ value, updatedAt: new Date() })
        .where(eq(settings.key, key));
    }
  }
}

export const storage = new DatabaseStorage();