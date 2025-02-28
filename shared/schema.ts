import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  deleted: boolean("deleted").default(false),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // In cents
  imageUrl: text("image_url"),
  categoryId: integer("category_id").references(() => categories.id),
  deleted: boolean("deleted").default(false),
});

// Tabla de pedidos
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  customerEmail: text("customer_email"),
  quantity: decimal("quantity", { precision: 3, scale: 1 }).notNull(),
  details: text("details"),
  pickupTime: timestamp("pickup_time").notNull(),
  status: text("status").default("pending"),
  deleted: boolean("deleted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabla de stock actual
export const stock = pgTable("stock", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  initialStock: decimal("initial_stock", { precision: 5, scale: 1 }).notNull(),
  currentStock: decimal("current_stock", { precision: 5, scale: 1 }).notNull(),
  reservedStock: decimal("reserved_stock", { precision: 5, scale: 1 }).notNull(),
  unreservedStock: decimal("unreserved_stock", { precision: 5, scale: 1 }).notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Tabla de historial de stock
export const stockHistory = pgTable("stock_history", {
  id: serial("id").primaryKey(),
  stockId: integer("stock_id").references(() => stock.id),
  action: text("action").notNull(), // 'add', 'subtract', 'reserve', 'unreserve'
  quantity: decimal("quantity", { precision: 5, scale: 1 }).notNull(),
  previousStock: decimal("previous_stock", { precision: 5, scale: 1 }).notNull(),
  newStock: decimal("new_stock", { precision: 5, scale: 1 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: text("created_by"), // usuario que realizó la acción
});

// Tabla de logs de pedidos
export const orderLogs = pgTable("order_logs", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  action: text("action").notNull(), // 'create', 'update', 'delete', 'confirm', 'error'
  previousState: text("previous_state"), // JSON string del estado anterior
  newState: text("new_state"), // JSON string del nuevo estado
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: text("created_by"),
});

export const businessHours = pgTable("business_hours", {
  id: serial("id").primaryKey(),
  dayOfWeek: integer("day_of_week").notNull(),
  openTime: text("open_time").notNull(),
  closeTime: text("close_time").notNull(),
  isOpen: boolean("is_open").default(true),
  autoUpdate: boolean("auto_update").default(true),
});

// Esquemas de inserción
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true, deleted: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, deleted: true });
export const insertOrderSchema = createInsertSchema(orders)
  .omit({ 
    id: true, 
    deleted: true, 
    status: true, 
    createdAt: true, 
    updatedAt: true 
  })
  .extend({
    pickupTime: z.string().transform((val) => new Date(val)),
    quantity: z.number().min(0).step(0.5), // Solo permitir incrementos de 0.5
  });

export const insertStockSchema = createInsertSchema(stock)
  .omit({ id: true, lastUpdated: true });

export const insertStockHistorySchema = createInsertSchema(stockHistory)
  .omit({ id: true, createdAt: true });

export const insertOrderLogSchema = createInsertSchema(orderLogs)
  .omit({ id: true, createdAt: true });

export const insertBusinessHoursSchema = createInsertSchema(businessHours).omit({ id: true });

// Types
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Stock = typeof stock.$inferSelect;
export type InsertStock = z.infer<typeof insertStockSchema>;
export type StockHistory = typeof stockHistory.$inferSelect;
export type InsertStockHistory = z.infer<typeof insertStockHistorySchema>;
export type OrderLog = typeof orderLogs.$inferSelect;
export type InsertOrderLog = z.infer<typeof insertOrderLogSchema>;
export type BusinessHours = typeof businessHours.$inferSelect;
export type InsertBusinessHours = z.infer<typeof insertBusinessHoursSchema>;