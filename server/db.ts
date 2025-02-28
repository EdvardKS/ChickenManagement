import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "@shared/schema";

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL!,
  // Adding additional configuration for WebSocket stability
  max: 1,
  connectionTimeoutMillis: 5000
});

export const db = drizzle(pool, { schema });

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

process.on('SIGINT', () => {
  pool.end();
  process.exit();
});