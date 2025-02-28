import { ReactNode } from "react";
import { Link } from "wouter";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-poppins">
      <header className="border-b">
        <div className="flex h-16 items-center px-4 max-w-7xl mx-auto">
          <Link href="/admin">
            <a className="flex items-center">
              <img 
                src="/img/corporativa/slogan-negro.png" 
                alt="Asador La Morenica" 
                className="h-8"
              />
            </a>
          </Link>
          <nav className="hidden md:flex ml-8 space-x-4">
            <Link href="/admin">
              <a className="text-sm hover:text-primary">Panel Principal</a>
            </Link>
            <Link href="/admin/orders">
              <a className="text-sm hover:text-primary">Pedidos</a>
            </Link>
            <Link href="/admin/dashboards/orders-overview">
              <a className="text-sm hover:text-primary">Dashboards</a>
            </Link>
            <Link href="/admin/products">
              <a className="text-sm hover:text-primary">Productos</a>
            </Link>
            <Link href="/admin/settings">
              <a className="text-sm hover:text-primary">Configuración</a>
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