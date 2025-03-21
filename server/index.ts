import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configuración de sesiones
const MemoryStore = new session.MemoryStore();

app.use(session({
  store: MemoryStore,
  secret: process.env.SESSION_SECRET || 'asador_la_morenica_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
    httpOnly: true
  }
}));

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
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
