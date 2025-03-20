import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { db } from "../db";
import { products, settings } from "../../shared/schema";
import { eq, desc, asc } from "drizzle-orm";

const router = Router();

// Claves de configuración para menús destacados
const FEATURED_MENU_1 = "featured_menu_1";
const FEATURED_MENU_2 = "featured_menu_2";
const FEATURED_MENU_3 = "featured_menu_3";

// Obtener todos los menús destacados
router.get("/featured", async (_req: Request, res: Response) => {
  try {
    // Primero, obtener los IDs de menús destacados desde settings
    const featuredSettings = await db.select()
      .from(settings)
      .where(
        eq(settings.key, FEATURED_MENU_1)
        .or(eq(settings.key, FEATURED_MENU_2))
        .or(eq(settings.key, FEATURED_MENU_3))
      );

    // Si no hay configuraciones, devolver menús destacados según la lógica actual
    if (featuredSettings.length === 0) {
      const featuredMenus = await storage.getFeaturedMenus();
      return res.json(featuredMenus);
    }

    // Extraer los IDs de producto de las configuraciones
    const featuredMenuIds = featuredSettings
      .filter(setting => setting.value && setting.value !== "0")
      .map(setting => parseInt(setting.value, 10))
      .filter(id => !isNaN(id));

    // Si no hay IDs válidos, devolver menús destacados según la lógica actual
    if (featuredMenuIds.length === 0) {
      const featuredMenus = await storage.getFeaturedMenus();
      return res.json(featuredMenus);
    }

    // Obtener los productos correspondientes a los IDs encontrados
    const featuredMenus = await db.select()
      .from(products)
      .where(
        featuredMenuIds.map(id => eq(products.id, id)).reduce((acc, condition) => acc.or(condition))
      );

    // Ordenar menús según el orden en settings
    const orderedMenus = featuredSettings
      .sort((a, b) => {
        const orderMap: { [key: string]: number } = {
          [FEATURED_MENU_1]: 1,
          [FEATURED_MENU_2]: 2,
          [FEATURED_MENU_3]: 3
        };
        return orderMap[a.key] - orderMap[b.key];
      })
      .map(setting => {
        if (!setting.value || setting.value === "0") return null;
        const id = parseInt(setting.value, 10);
        return featuredMenus.find(menu => menu.id === id);
      })
      .filter(menu => menu !== null);

    return res.json(orderedMenus);
  } catch (error) {
    console.error("Error al obtener menús destacados:", error);
    return res.status(500).json({ error: "Error al obtener los menús destacados" });
  }
});

// Obtener todos los productos de la categoría menús (ID 1)
router.get("/all", async (_req: Request, res: Response) => {
  try {
    const allMenus = await storage.getProducts(1); // Asumiendo que la categoría ID 1 son los menús
    
    // Obtener las configuraciones de menús destacados
    const featuredSettings = await db.select()
      .from(settings)
      .where(
        eq(settings.key, FEATURED_MENU_1)
        .or(eq(settings.key, FEATURED_MENU_2))
        .or(eq(settings.key, FEATURED_MENU_3))
      );
    
    // Crear un mapa de ID de menú -> posición en destacados
    const featuredMap: { [key: number]: number } = {};
    
    featuredSettings.forEach(setting => {
      if (!setting.value || setting.value === "0") return;
      
      const id = parseInt(setting.value, 10);
      if (isNaN(id)) return;
      
      const position = setting.key === FEATURED_MENU_1 ? 0 :
                      setting.key === FEATURED_MENU_2 ? 1 : 2;
      
      featuredMap[id] = position;
    });
    
    // Marcar los menús destacados y asignar su orden
    const menus = allMenus.map(menu => ({
      ...menu,
      featured: featuredMap.hasOwnProperty(menu.id),
      featuredOrder: featuredMap.hasOwnProperty(menu.id) ? featuredMap[menu.id] : null
    }));
    
    return res.json(menus);
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
    
    // Si featured es false, eliminar este menú de las configuraciones de destacados
    if (!featured) {
      // Buscar en qué posición está este menú
      const featuredSettings = await db.select()
        .from(settings)
        .where(eq(settings.key, FEATURED_MENU_1))
        .or(eq(settings.key, FEATURED_MENU_2))
        .or(eq(settings.key, FEATURED_MENU_3));
      
      for (const setting of featuredSettings) {
        if (setting.value === menuId.toString()) {
          // Encontrado, actualizar a valor vacío
          await db.update(settings)
            .set({ value: "0" })
            .where(eq(settings.key, setting.key));
          break;
        }
      }
      
      // Actualizar el menú en la base de datos
      const updatedMenu = await storage.updateFeaturedMenu(menuId, false, 0);
      return res.json(updatedMenu);
    }
    
    // Si featured es true, agregarlo a la posición correspondiente
    let targetKey = "";
    
    switch (order) {
      case 0:
        targetKey = FEATURED_MENU_1;
        break;
      case 1:
        targetKey = FEATURED_MENU_2;
        break;
      case 2:
        targetKey = FEATURED_MENU_3;
        break;
      default:
        // Si el orden es mayor, usar el tercer slot
        targetKey = FEATURED_MENU_3;
    }
    
    // Verificar si ya existe la configuración
    const existingConfig = await db.select()
      .from(settings)
      .where(eq(settings.key, targetKey))
      .limit(1);
    
    if (existingConfig.length > 0) {
      // Actualizar existente
      await db.update(settings)
        .set({ value: menuId.toString() })
        .where(eq(settings.key, targetKey));
    } else {
      // Crear nueva configuración
      await db.insert(settings)
        .values({
          key: targetKey,
          value: menuId.toString()
        });
    }
    
    // Actualizar el menú en la base de datos
    const updatedMenu = await storage.updateFeaturedMenu(menuId, true, order);
    return res.json(updatedMenu);
  } catch (error) {
    console.error("Error al actualizar menú destacado:", error);
    return res.status(500).json({ error: "Error al actualizar menú destacado" });
  }
});

export default router;