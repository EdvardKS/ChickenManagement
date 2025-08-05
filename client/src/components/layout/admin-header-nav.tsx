import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  ChartBar, 
  Package, 
  Settings, 
  Database,
  Clock,
  FileJson,
  Star,
  ChevronUp,
  ChevronDown
} from "lucide-react";

const navItems = [
  {
    title: "Pedidos",
    href: "/admin/orders",
    icon: Package
  },
  {
    title: "Dashboards",
    href: "/admin/dashboards/orders-overview",
    icon: ChartBar
  },
  {
    title: "Horarios",
    href: "/admin/horarios",
    icon: Clock
  },
  {
    title: "Base de Datos",
    href: "/admin/database",
    icon: Database
  },
  {
    title: "Semillas",
    href: "/admin/seeds",
    icon: FileJson
  },
  {
    title: "Configuración",
    href: "/admin/settings",
    icon: Settings
  }
];

export function AdminHeaderNav() {
  const [location] = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const hideMenu = () => setIsMenuOpen(false);

  // Get current page title
  const currentPage = navItems.find(item => item.href === location)?.title || "Administración";

  useEffect(() => {
    // Script al montarse el componente
    console.log("AdminHeaderNav cargado. Ruta actual:", location);

    // Ejemplo: ocultar menú si estamos en un dashboard avanzado
    if (location.startsWith("/admin/dashboards/stock")) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }

    // También podrías hacer scroll o cargar data si necesitas
    // window.scrollTo(0, 0);
  }, [location]);

  if (!isVisible) return null;

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Aquí puedes meter tu UI del nav */}
    </div>
  );
}
