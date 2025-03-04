import { Separator } from "@/components/ui/separator";
import { Link, useLocation } from "wouter";
import { SidebarNav } from "./sidebar-nav";
import { 
  ShoppingBag, 
  ChartBar, 
  Package, 
  Settings, 
  Database,
  Clock,
  FileJson
} from "lucide-react";

const sidebarNavItems = [
  {
    title: "Panel Principal",
    href: "/admin",
    icon: ShoppingBag
  },
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-10 pb-16">
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
