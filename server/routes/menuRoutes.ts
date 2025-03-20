import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";

const router = Router();

// Obtener todos los menús destacados
router.get("/featured", async (_req: Request, res: Response) => {
  try {
    const featuredMenus = await storage.getFeaturedMenus();
    return res.json(featuredMenus);
  } catch (error) {
    console.error("Error al obtener menús destacados:", error);
    return res.status(500).json({ error: "Error al obtener los menús destacados" });
  }
});

// Obtener todos los productos de la categoría menús (ID 1)
router.get("/all", async (_req: Request, res: Response) => {
  try {
    const allMenus = await storage.getProducts(1); // Asumiendo que la categoría ID 1 son los menús
    return res.json(allMenus);
  } catch (error) {
    console.error("Error al obtener todos los menús:", error);
    return res.status(500).json({ error: "Error al obtener todos los menús" });
  }
});

// Actualizar estado destacado de un menú
const updateFeaturedSchema = z.object({
  featured: z.boolean(),
  order: z.number().optional()
});

router.patch("/:id/featured", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const menuId = parseInt(id, 10);
    
    if (isNaN(menuId)) {
      return res.status(400).json({ error: "ID de menú inválido" });
    }
    
    const result = updateFeaturedSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Datos inválidos", details: result.error.format() });
    }
    
    const { featured, order = 0 } = result.data;
    
    const updatedMenu = await storage.updateFeaturedMenu(menuId, featured, order);
    return res.json(updatedMenu);
  } catch (error) {
    console.error("Error al actualizar menú destacado:", error);
    return res.status(500).json({ error: "Error al actualizar menú destacado" });
  }
});

export default router;