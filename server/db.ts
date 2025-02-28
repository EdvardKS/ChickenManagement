import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

// Use environment variable for database URL
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

// Helper function to run migrations
export async function push() {
  try {
    // Import is done dynamically to avoid issues with ESM
    const { migrate } = await import("drizzle-orm/neon-serverless/migrator");
    await migrate(db, { migrationsFolder: "./migrations" });
    return true;
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}