import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import {
  type Category, type InsertCategory,
  type Product, type InsertProduct,
  type Order, type InsertOrder,
  type Stock, type InsertStock,
  type BusinessHours, type InsertBusinessHours,
  categories, products, orders, stock, businessHours
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

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
  markOrderAsError(id: number): Promise<void>;

  // Stock
  getCurrentStock(): Promise<Stock | undefined>;
  updateStock(stock: Partial<Stock>): Promise<Stock>;

  // Business Hours
  getBusinessHours(): Promise<BusinessHours[]>;
  updateBusinessHours(id: number, hours: Partial<InsertBusinessHours>): Promise<BusinessHours>;
}

// Configure database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool, { schema: { categories, products, orders, stock, businessHours } });

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
    let query = db
      .select()
      .from(products)
      .where(eq(products.deleted, false));

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
    try {
      console.log('Fetching orders from database...');
      const orders = await db
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.deleted, false),
            eq(orders.status, "pending") // Only get pending orders
          )
        )
        .orderBy(orders.pickupTime);
      console.log('Fetched orders:', orders);
      return orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db
      .insert(orders)
      .values({ ...order, status: "pending", deleted: false })
      .returning();
    return newOrder;
  }

  async updateOrder(id: number, updates: Partial<Order>): Promise<Order> {
    try {
      console.log('Updating order:', id, updates);
      const [updated] = await db
        .update(orders)
        .set(updates)
        .where(eq(orders.id, id))
        .returning();
      console.log('Updated order:', updated);
      return updated;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  async deleteOrder(id: number): Promise<void> {
    await db
      .update(orders)
      .set({ deleted: true })
      .where(eq(orders.id, id));
  }

  async markOrderAsError(id: number): Promise<void> {
    try {
      console.log('Marking order as error:', id);
      const res = await db
        .update(orders)
        .set({ 
          status: "error",
          deleted: true, // Mark as deleted to remove from active orders
          errorDate: new Date()
        })
        .where(eq(orders.id, id))
        .returning();
      console.log('Order marked as error result:', res);
    } catch (error) {
      console.error('Error marking order as error:', error);
      throw error;
    }
  }

  // Stock
  async getCurrentStock(): Promise<Stock | undefined> {
    const [currentStock] = await db
      .select()
      .from(stock)
      .orderBy(stock.date)
      .limit(1);
    return currentStock;
  }

  async updateStock(stockUpdate: Partial<Stock>): Promise<Stock> {
    const [updated] = await db
      .update(stock)
      .set(stockUpdate)
      .where(eq(stock.id, stockUpdate.id!))
      .returning();
    return updated;
  }

  // Business Hours
  async getBusinessHours(): Promise<BusinessHours[]> {
    return await db.select().from(businessHours);
  }

  async updateBusinessHours(id: number, hours: Partial<InsertBusinessHours>): Promise<BusinessHours> {
    const [updated] = await db
      .update(businessHours)
      .set(hours)
      .where(eq(businessHours.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();