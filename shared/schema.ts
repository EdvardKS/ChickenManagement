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

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  customerEmail: text("customer_email"),
  quantity: decimal("quantity", { precision: 3, scale: 1 }).notNull(),
  items: text("items").array(),
  totalAmount: integer("total_amount").notNull(),
  status: text("status", { enum: ['pending', 'delivered', 'cancelled', 'error'] }).default("pending"),
  pickupTime: timestamp("pickup_time").notNull(),
  deleted: boolean("deleted").default(false),
});

export const stock = pgTable("stock", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  initialStock: decimal("initial_stock", { precision: 5, scale: 1 }).notNull(),
  currentStock: decimal("current_stock", { precision: 5, scale: 1 }).notNull(),
  unreservedStock: decimal("unreserved_stock", { precision: 5, scale: 1 }).notNull(),
  reservedStock: decimal("reserved_stock", { precision: 5, scale: 1 }).notNull(),
});

export const stockLogs = pgTable("stock_logs", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  operation: text("operation", { 
    enum: ['initial_setup', 'order_delivered', 'order_cancelled', 'order_error', 'manual_adjustment'] 
  }).notNull(),
  quantity: decimal("quantity", { precision: 5, scale: 1 }).notNull(),
  previousStock: decimal("previous_stock", { precision: 5, scale: 1 }).notNull(),
  newStock: decimal("new_stock", { precision: 5, scale: 1 }).notNull(),
  orderId: integer("order_id").references(() => orders.id),
  notes: text("notes"),
});

export const businessHours = pgTable("business_hours", {
  id: serial("id").primaryKey(),
  dayOfWeek: integer("day_of_week").notNull(),
  openTime: text("open_time").notNull(),
  closeTime: text("close_time").notNull(),
  isOpen: boolean("is_open").default(true),
  autoUpdate: boolean("auto_update").default(true),
});

// Insert Schemas
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true, deleted: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, deleted: true });
export const insertOrderSchema = createInsertSchema(orders)
  .omit({ id: true, deleted: true, status: true })
  .extend({
    pickupTime: z.string().transform((val) => new Date(val)),
    quantity: z.number().min(0.5).step(0.5),
  });

export const insertStockSchema = createInsertSchema(stock).omit({ id: true });
export const insertStockLogSchema = createInsertSchema(stockLogs).omit({ id: true });
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
export type StockLog = typeof stockLogs.$inferSelect;
export type InsertStockLog = z.infer<typeof insertStockLogSchema>;
export type BusinessHours = typeof businessHours.$inferSelect;
export type InsertBusinessHours = z.infer<typeof insertBusinessHoursSchema>;