import { Express } from "express";
import { db } from '../db';
import { settings } from '@shared/schema';
import { eq } from 'drizzle-orm';

export function registerSettingsRoutes(app: Express) {
  // Settings endpoints
  app.get("/api/settings", async (_req, res) => {
    try {
      const result = await db.select().from(settings);
      res.json(result);
    } catch (error) {
      console.error('Error getting settings:', error);
      res.status(500).json({ error: 'Error al obtener la configuración' });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const { key, value } = req.body;

      const existing = await db
        .select()
        .from(settings)
        .where(eq(settings.key, key))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(settings)
          .set({ value, updatedAt: new Date() })
          .where(eq(settings.key, key));
      } else {
        await db
          .insert(settings)
          .values({ key, value });
      }

      res.json({ message: 'Configuración actualizada' });
    } catch (error) {
      console.error('Error updating setting:', error);
      res.status(500).json({ error: 'Error al actualizar la configuración' });
    }
  });

  app.delete("/api/settings/:key", async (req, res) => {
    try {
      const { key } = req.params;
      await db
        .delete(settings)
        .where(eq(settings.key, key));
      res.json({ message: 'Configuración eliminada' });
    } catch (error) {
      console.error('Error deleting setting:', error);
      res.status(500).json({ error: 'Error al eliminar la configuración' });
    }
  });
}
