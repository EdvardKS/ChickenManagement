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

    </div>
  );
}