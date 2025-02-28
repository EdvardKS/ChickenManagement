import {
  type Category, type InsertCategory,
  type Product, type InsertProduct,
  type Order, type InsertOrder,
  type Stock, type InsertStock,
  type StockLog, type InsertStockLog,
  type BusinessHours, type InsertBusinessHours
} from "@shared/schema";

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

  // Stock Logs
  createStockLog(log: InsertStockLog): Promise<StockLog>;

  // Business Hours
  getBusinessHours(): Promise<BusinessHours[]>;
  updateBusinessHours(id: number, hours: Partial<InsertBusinessHours>): Promise<BusinessHours>;
}

export class MemStorage implements IStorage {
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private stockRecords: Map<string, Stock>;
  private stockLogs: Map<number, StockLog>;
  private businessHours: Map<number, BusinessHours>;
  private currentId: { [key: string]: number };

  constructor() {
    this.categories = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.stockRecords = new Map();
    this.stockLogs = new Map();
    this.businessHours = new Map();
    this.currentId = {
      categories: 1,
      products: 1,
      orders: 1,
      stock: 1,
      stockLogs: 1,
      businessHours: 1
    };
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(c => !c.deleted);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.currentId.categories++;
    const newCategory = { 
      ...category, 
      id, 
      deleted: false,
      description: category.description || null,
      imageUrl: category.imageUrl || null
    };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category> {
    const existing = await this.getCategory(id);
    if (!existing) throw new Error("Category not found");
    const updated = { ...existing, ...category };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: number): Promise<void> {
    const category = await this.getCategory(id);
    if (category) {
      this.categories.set(id, { ...category, deleted: true });
    }
  }

  // Products
  async getProducts(categoryId?: number): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(p => !p.deleted && (!categoryId || p.categoryId === categoryId));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentId.products++;
    const newProduct = { 
      ...product, 
      id, 
      deleted: false,
      description: product.description || null,
      imageUrl: product.imageUrl || null,
      categoryId: product.categoryId || null
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const existing = await this.getProduct(id);
    if (!existing) throw new Error("Product not found");
    const updated = { ...existing, ...product };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    const product = await this.getProduct(id);
    if (product) {
      this.products.set(id, { ...product, deleted: true });
    }
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(o => !o.deleted);
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.currentId.orders++;
    const newOrder = { 
      ...order, 
      id, 
      deleted: false, 
      status: "pending",
      customerPhone: order.customerPhone || null,
      customerEmail: order.customerEmail || null,
      items: order.items || null,
      quantity: order.quantity.toString()
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrder(id: number, order: Partial<Order>): Promise<Order> {
    const existing = await this.getOrder(id);
    if (!existing) throw new Error("Order not found");
    const updated = { ...existing, ...order };
    this.orders.set(id, updated);
    return updated;
  }

  async deleteOrder(id: number): Promise<void> {
    const order = await this.getOrder(id);
    if (order) {
      this.orders.set(id, { ...order, deleted: true });
    }
  }

  // Stock
  async getCurrentStock(): Promise<Stock | undefined> {
    const today = new Date().toISOString().split('T')[0];
    return this.stockRecords.get(today);
  }

  async updateStock(stock: Partial<Stock>): Promise<Stock> {
    const today = new Date().toISOString().split('T')[0];
    const current = this.stockRecords.get(today);

    const updated: Stock = {
      id: current?.id || this.currentId.stock++,
      date: stock.date || current?.date || new Date(),
      initialStock: stock.initialStock || current?.initialStock || "0",
      currentStock: stock.currentStock || current?.currentStock || "0",
      unreservedStock: stock.unreservedStock || current?.unreservedStock || "0",
      reservedStock: stock.reservedStock || current?.reservedStock || "0"
    };

    this.stockRecords.set(today, updated);
    return updated;
  }

  // Stock Logs
  async createStockLog(log: InsertStockLog): Promise<StockLog> {
    const id = this.currentId.stockLogs++;
    const newLog = { ...log, id };
    this.stockLogs.set(id, newLog);
    return newLog;
  }

  // Business Hours
  async getBusinessHours(): Promise<BusinessHours[]> {
    return Array.from(this.businessHours.values());
  }

  async updateBusinessHours(id: number, hours: Partial<InsertBusinessHours>): Promise<BusinessHours> {
    const existing = this.businessHours.get(id);
    if (!existing) throw new Error("Business hours not found");
    const updated = { ...existing, ...hours };
    this.businessHours.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();