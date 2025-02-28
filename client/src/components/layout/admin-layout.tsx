import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import AdminDrawer from "./admin-drawer";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background font-poppins">
      <header className="border-b">
        <div className="flex h-16 items-center px-4 max-w-7xl mx-auto">
          <div className="flex items-center">
            <AdminDrawer />
            <Link href="/admin">
              <a className="ml-4 md:ml-0">
                <img 
                  src="/img/corporativa/slogan-negro.png" 
                  alt="Asador La Morenica" 
                  className="h-8"
                />
              </a>
            </Link>
          </div>
          <nav className="hidden md:flex ml-8 space-x-4">
            <Link href="/admin">
              <a className={`text-sm ${location === "/admin" ? "text-primary" : "hover:text-primary"}`}>
                Panel Principal
              </a>
            </Link>
            <Link href="/admin/orders">
              <a className={`text-sm ${location === "/admin/orders" ? "text-primary" : "hover:text-primary"}`}>
                Pedidos
              </a>
            </Link>
            <Link href="/admin/dashboards/orders-overview">
              <a className={`text-sm ${location.startsWith("/admin/dashboards") ? "text-primary" : "hover:text-primary"}`}>
                Dashboards
              </a>
            </Link>
            <Link href="/admin/products">
              <a className={`text-sm ${location === "/admin/products" ? "text-primary" : "hover:text-primary"}`}>
                Productos
              </a>
            </Link>
            <Link href="/admin/settings">
              <a className={`text-sm ${location === "/admin/settings" ? "text-primary" : "hover:text-primary"}`}>
                Configuración
              </a>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 md:p-8 pt-6 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}