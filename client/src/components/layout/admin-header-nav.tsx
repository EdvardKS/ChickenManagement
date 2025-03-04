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

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center px-4">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setIsVisible(!isVisible)}
        >
          {isVisible ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isVisible && (
        <nav className="flex items-center space-x-4 px-4 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={location === item.href ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "h-8 gap-2",
                    location === item.href
                      ? "bg-muted hover:bg-muted"
                      : "hover:bg-transparent hover:underline"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}