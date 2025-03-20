import { useState } from "react";
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
    title: "Menús Destacados",
    href: "/admin/featured-menus",
    icon: Star
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

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <span className="font-semibold">Admin</span>
        </div>
        
        <div className="relative md:mr-auto">
          <Button
            variant="ghost"
            onClick={toggleMenu}
            className="flex items-center gap-1 font-medium"
          >
            {currentPage}
            {isMenuOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          
          {isMenuOpen && (
            <div className="absolute top-full left-0 z-50 mt-1 w-60 rounded-md border bg-background shadow-lg">
              <div className="p-1">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className="w-full justify-start gap-2 rounded-sm px-2 py-1.5 text-sm"
                        onClick={hideMenu}
                      >
                        <Icon className="h-4 w-4" />
                        {item.title}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="sm">
              Ver sitio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}