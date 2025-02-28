import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
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
  customerPhone: text("customer_phone"),  // Remove .notNull() to allow null
  customerEmail: text("customer_email"),
  quantity: integer("quantity").notNull(),
  items: text("items").array(),
  totalAmount: integer("total_amount").notNull(),
  status: text("status").default("pending"),
  pickupTime: timestamp("pickup_time").notNull(),
  deleted: boolean("deleted").default(false),
});

export const stock = pgTable("stock", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  initialStock: integer("initial_stock").notNull(),
  currentStock: integer("current_stock").notNull(),
  unreservedStock: integer("unreserved_stock").notNull(),
  reservedStock: integer("reserved_stock").notNull(),
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
  pickupTime: z.string().transform((val) => new Date(val)), // Convierte el string a Date automáticamente
});

export const insertStockSchema = createInsertSchema(stock).omit({ id: true });
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
export type BusinessHours = typeof businessHours.$inferSelect;
export type InsertBusinessHours = z.infer<typeof insertBusinessHoursSchema>;