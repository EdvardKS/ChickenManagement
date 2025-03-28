import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configuración de sesiones
// Crear una instancia de PgStore para almacenar sesiones en PostgreSQL
const PgStore = connectPgSimple(session);

// Configurar la conexión a la base de datos para sesiones
const pgPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

// Configurar middleware para agregar encabezados CORS
app.use((req, res, next) => {
  // Permitir credenciales en solicitudes cross-origin
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Establecer origen permitido (en producción ajustar al dominio exacto)
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  
  // Permitir métodos HTTP
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
  
  // Permitir encabezados personalizados
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Manejar solicitudes preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Determinar si estamos en producción
const isProduction = process.env.NODE_ENV === 'production';
console.log(`🔐 Configurando sesión - Entorno: ${isProduction ? 'producción' : 'desarrollo'}`);

app.use(session({
  store: new PgStore({
    pool: pgPool,
    tableName: 'session', // Nombre de la tabla en la que se almacenarán las sesiones
    createTableIfMissing: true, // Crear la tabla si no existe
  }),
  secret: process.env.SESSION_SECRET || 'asador_la_morenica_secret',
  resave: false,
  saveUninitialized: false,
  name: 'asador.sid', // Nombre de cookie personalizado
  proxy: isProduction, // Confiar en encabezados proxy en producción
  cookie: {
    secure: isProduction, // Solo HTTPS en producción
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
    httpOnly: true,
    sameSite: isProduction ? 'none' as const : 'lax' as const,
    domain: isProduction ? process.env.COOKIE_DOMAIN : undefined // Dominio específico en producción
  }
}));

// Registrar middleware para depurar sesiones
app.use((req, res, next) => {
  console.log(`🍪 Session - Request cookie headers: ${JSON.stringify(req.headers.cookie)}`);
  console.log(`🍪 Session - Session ID: ${req.session.id}`);
  console.log(`🍪 Session - User ID: ${req.session.userId || 'no autenticado'}`);
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('🔴 SERVER ERROR:');
    console.error('📌 Error message:', err.message);
    console.error('📌 Error stack:', err.stack);
    
    // Si es un error de validación de Zod, extraer detalles
    if (err.name === 'ZodError' && err.errors) {
      console.error('📌 Zod validation errors:', JSON.stringify(err.errors, null, 2));
      return res.status(400).json({ 
        error: 'Validation error', 
        details: err.errors,
        message: err.message
      });
    }
    
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    // Construir un objeto de respuesta detallado
    const errorResponse = {
      error: message,
      status,
      code: err.code,
      details: err.details || undefined,
      // Solo incluir stack trace en desarrollo
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    };
    
    console.error('📌 Sending error response:', JSON.stringify(errorResponse, null, 2));
    
    // Enviar respuesta de error
    res.status(status).json(errorResponse);
    
    // No lanzar el error nuevamente - solo registrar
    console.error(err);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client
  const env = process.env.NODE_ENV || "development";
  const port = env === "production" ? 2025 : 5000;

  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
