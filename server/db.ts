import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "@shared/schema";
import { WebSocket } from "ws";

// Configure database connection with retries
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL!,
  max: 1,
  connectionTimeoutMillis: 5000,
  // Use the ws package for WebSocket connections
  webSocketConstructor: WebSocket as any
});

const db = drizzle(pool, { schema });

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

// Handle database connection cleanup
process.on('SIGINT', () => {
  pool.end();
  process.exit();
});

// Add a basic health check function
export async function checkConnection() {
  try {
    await pool.query('SELECT 1');
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Initialize connection and run migrations
checkConnection()
  .then(() => {
    console.log('Database connected, running migrations...');
    return push();
  })
  .then(() => {
    console.log('Migrations completed successfully');
  })
  .catch(console.error);
