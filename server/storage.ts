import {
  type Category, type InsertCategory,
  type Product, type InsertProduct,
  type Order, type InsertOrder,
  type Stock, type InsertStock,
  type BusinessHours, type InsertBusinessHours,
  type StockHistory, type InsertStockHistory,
  type User, type InsertUser,
  categories, products, orders, stock, stockHistory, orderLogs, businessHours, settings, users
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
  
  // Featured Menus
  getFeaturedMenus(): Promise<Product[]>;
  updateFeaturedMenu(id: number, featured: boolean, order?: number): Promise<Product>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, orderData: Partial<Order>): Promise<Order>;
  deleteOrder(id: number): Promise<void>;

  // Stock
  getCurrentStock(): Promise<Stock | undefined>;
  updateStock(stockData: Partial<Stock>): Promise<Stock>;
  createStockHistory(history: StockHistory): Promise<StockHistory>;
  getStockHistory(stockId?: number): Promise<StockHistory[]>;

  // Business Hours
  getBusinessHours(): Promise<BusinessHours[]>;
  createBusinessHours(hours: InsertBusinessHours): Promise<BusinessHours>;
  updateBusinessHours(id: number, hours: Partial<InsertBusinessHours>): Promise<BusinessHours>;

  // Settings
  getSetting(key: string): Promise<string | null>;
  getSettingsByKeys(keys: string[]): Promise<Record<string, string>>;
  updateSetting(key: string, value: string): Promise<void>;
  
  // Users
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  createUser(userData: Omit<InsertUser, 'confirmPassword'>): Promise<User>;
  updateUser(id: number, userData: Partial<Omit<InsertUser, 'confirmPassword'>>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getFesteroUsers(): Promise<User[]>;
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
  
  // Featured Menus
  async getFeaturedMenus(): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(and(
        eq(products.deleted, false),
        eq(products.featured, true)
      ))
      .orderBy(products.featuredOrder);
  }
  
  async updateFeaturedMenu(id: number, featured: boolean, order: number = 0): Promise<Product> {
    const [updated] = await db
      .update(products)
      .set({ 
        featured: featured,
        featuredOrder: order 
      })
      .where(eq(products.id, id))
      .returning();
    return updated;
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
    console.log('📝 Storage - Create Order - Starting creation with data:', JSON.stringify(order, null, 2));
    
    // Verificar los tipos de datos y su estructura
    console.log('🔍 Storage - Create Order - Verificando tipos de datos:');
    console.log('   - customerName:', typeof order.customerName, order.customerName);
    console.log('   - quantity:', typeof order.quantity, order.quantity);
    console.log('   - pickupTime:', typeof order.pickupTime, 
      order.pickupTime instanceof Date ? 'Es instancia de Date' : 'No es instancia de Date', 
      order.pickupTime);
    
    if (order.customerPhone) console.log('   - customerPhone:', typeof order.customerPhone, order.customerPhone);
    if (order.customerEmail) console.log('   - customerEmail:', typeof order.customerEmail, order.customerEmail);
    if (order.customerDNI) console.log('   - customerDNI:', typeof order.customerDNI, order.customerDNI);
    if (order.customerAddress) console.log('   - customerAddress:', typeof order.customerAddress, order.customerAddress);
    if (order.details) console.log('   - details:', typeof order.details, order.details);
    if (order.totalAmount) console.log('   - totalAmount:', typeof order.totalAmount, order.totalAmount);

    // Asegurar que pickupTime es instancia de Date
    if (!(order.pickupTime instanceof Date)) {
      console.log('⚠️ Storage - Create Order - pickupTime no es una instancia de Date, intentando convertir:', order.pickupTime);
      try {
        // Si pickupTime es una cadena en formato HH:MM, crear fecha para hoy
        if (typeof order.pickupTime === 'string' && /^\d{1,2}:\d{2}$/.test(order.pickupTime)) {
          const today = new Date();
          const [hours, minutes] = order.pickupTime.split(':').map(Number);
          order.pickupTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
          console.log('✅ Storage - Create Order - pickupTime convertido desde HH:MM:', order.pickupTime);
        } else {
          order.pickupTime = new Date(order.pickupTime);
          console.log('✅ Storage - Create Order - pickupTime convertido correctamente:', order.pickupTime);
        }
        
        // Verificar que la fecha es válida
        if (isNaN(order.pickupTime.getTime())) {
          throw new Error('Fecha resultante inválida');
        }
      } catch (dateError) {
        console.error('❌ Storage - Create Order - Error al convertir pickupTime:', dateError);
        throw new Error(`Fecha inválida: ${order.pickupTime}`);
      }
    }
    
    // Asegurar que quantity sea un número y convertirlo a string para la base de datos
    let quantityNum = order.quantity;
    if (typeof quantityNum !== 'number') {
      console.log('⚠️ Storage - Create Order - quantity no es un número, intentando convertir:', quantityNum);
      try {
        quantityNum = Number(quantityNum);
        if (isNaN(quantityNum)) throw new Error(`Valor no numérico: ${order.quantity}`);
        console.log('✅ Storage - Create Order - quantity convertido correctamente:', quantityNum);
      } catch (numError) {
        console.error('❌ Storage - Create Order - Error al convertir quantity:', numError);
        throw new Error(`Cantidad inválida: ${order.quantity}`);
      }
    }
    
    // Preparamos los datos para la inserción
    const now = new Date();
    const orderData = {
      ...order,
      quantity: quantityNum.toString(), // Convertimos a string explícitamente para la BD
      status: 'pending',
      createdAt: now,
      updatedAt: now
    };
    
    console.log('🔄 Storage - Create Order - Datos finales para inserción:', JSON.stringify(orderData, null, 2));
    
    try {
      console.log('🚀 Storage - Create Order - Ejecutando inserción en la base de datos...');
      const [newOrder] = await db
        .insert(orders)
        .values(orderData)
        .returning();
      
      console.log('✅ Storage - Create Order - Inserción exitosa, orden creada:', newOrder);
  
      // Registrar en el log
      console.log('📝 Storage - Create Order - Registrando en logs...');
      await db.insert(orderLogs).values({
        orderId: newOrder.id,
        action: 'create',
        newState: JSON.stringify(newOrder),
        createdBy: 'system'
      });
      console.log('✅ Storage - Create Order - Log registrado correctamente');
  
      return newOrder;
    } catch (dbError) {
      console.error('❌ Storage - Create Order - Error de base de datos:', dbError);
      throw dbError;
    }
  }

  async updateOrder(id: number, orderData: Partial<Order>): Promise<Order> {
    console.log('📝 Storage - Update Order - Starting update for order:', id);
    console.log('📦 Storage - Update Order - Input data:', orderData);

    const oldOrder = await this.getOrder(id);
    console.log('📌 Storage - Update Order - Old order state:', oldOrder);

    if (!oldOrder) {
      console.log('❌ Storage - Update Order - Order not found:', id);
      throw new Error('Order not found');
    }

    // Preparar datos para actualización y asegurar compatibilidad de tipos
    // Eliminar los campos de fecha que no son proporcionados para evitar errores
    const sanitizedData = { ...orderData };
    
    // Solo procesar pickupTime si existe en los datos de entrada
    if (sanitizedData.pickupTime !== undefined) {
      sanitizedData.pickupTime = sanitizedData.pickupTime instanceof Date 
        ? sanitizedData.pickupTime 
        : new Date(sanitizedData.pickupTime as string);
    } else {
      delete sanitizedData.pickupTime;
    }

    // Convertir quantity a string si existe
    if (sanitizedData.quantity !== undefined) {
      sanitizedData.quantity = sanitizedData.quantity.toString();
    }

    // Siempre incluir la fecha de actualización
    const updatedData = {
      ...sanitizedData,
      updatedAt: new Date()
    };

    console.log('🔄 Storage - Update Order - Processed data for update:', updatedData);

    try {
      const [updated] = await db
        .update(orders)
        .set(updatedData)
        .where(eq(orders.id, id))
        .returning();

      console.log('✅ Storage - Update Order - Successfully updated order:', updated);

      // Log the change
      await db.insert(orderLogs).values({
        orderId: id,
        action: 'update',
        previousState: JSON.stringify(oldOrder),
        newState: JSON.stringify(updated),
        createdBy: 'system'
      });

      return updated;
    } catch (error) {
      console.error('❌ Storage - Update Order - Database error:', error);
      throw error;
    }
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

    // Obtener el stock más reciente para el día actual, ordenado por id descendente
    // para obtener siempre la última entrada
    const [currentStock] = await db
      .select()
      .from(stock)
      .where(eq(stock.date, today))
      .orderBy(desc(stock.id))
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
    console.log("📦 Storage - Actualizando stock:", stockData);

    const currentStock = await this.getCurrentStock();
    if (!currentStock) throw new Error('No stock found');

    // Mantener valores actuales excepto los que se actualizan
    const updatedValues = {
      initialStock: stockData.initialStock || currentStock.initialStock,
      currentStock: stockData.currentStock || currentStock.currentStock,
      reservedStock: stockData.reservedStock || currentStock.reservedStock,
      unreservedStock: stockData.unreservedStock || (
        parseFloat(stockData.currentStock || currentStock.currentStock) -
        parseFloat(stockData.reservedStock || currentStock.reservedStock)
      ).toString(),
      lastUpdated: new Date()
    };

    console.log("✅ Storage - Valores actualizados:", updatedValues);

    const [updatedStock] = await db
      .update(stock)
      .set(updatedValues)
      .where(eq(stock.id, currentStock.id))
      .returning();

    return updatedStock;
  }

  async createStockHistory(history: StockHistory): Promise<StockHistory> {
    console.log('Creating stock history:', history);
    // Extraer solo los campos necesarios para la inserción
    const historyToInsert = {
      stockId: history.stockId,
      action: history.action,
      quantity: history.quantity,
      previousStock: history.previousStock,
      newStock: history.newStock,
      createdBy: history.createdBy,
      createdAt: history.createdAt
    };

    const [newHistory] = await db
      .insert(stockHistory)
      .values(historyToInsert)
      .returning();

    console.log('Created stock history:', newHistory);
    return newHistory;
  }

  async getStockHistory(stockId?: number): Promise<StockHistory[]> {
    let query = db.select().from(stockHistory);
    
    if (stockId) {
      query = query.where(eq(stockHistory.stockId, stockId));
    }
    
    return await query.orderBy(desc(stockHistory.createdAt));
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

  // Users
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(
        eq(users.username, username),
        eq(users.active, true)
      ));
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(
        eq(users.id, id),
        eq(users.active, true)
      ));
    return user;
  }

  async createUser(userData: Omit<InsertUser, 'confirmPassword'>): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values(userData)
      .returning();
    return newUser;
  }

  async updateUser(id: number, userData: Partial<Omit<InsertUser, 'confirmPassword'>>): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users);
  }

  async getFesteroUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.role, 'festero'))
      .where(eq(users.active, true));
  }
}

export const storage = new DatabaseStorage();