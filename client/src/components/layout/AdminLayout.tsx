import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Link, useLocation } from "wouter";

const adminMenuItems = [
  {
    title: "Panel Principal",
    href: "/admin",
  },
  {
    title: "Pedidos",
    href: "/admin/orders",
  },
  {
    title: "Productos",
    href: "/admin/products",
  },
  {
    title: "Base de Datos",
    href: "/admin/database",
  },
  {
    title: "Dashboards",
    items: [
      { title: "Vista General de Pedidos", href: "/admin/dashboards/orders-overview" },
      { title: "Niveles de Stock", href: "/admin/dashboards/stock-levels" },
      { title: "Análisis de Ventas", href: "/admin/dashboards/sales-analysis" },
      { title: "Análisis de Clientes", href: "/admin/dashboards/customer-analysis" },
      { title: "Rendimiento de Productos", href: "/admin/dashboards/product-performance" },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => location === href;

  return (
    <div className="font-poppins min-h-screen bg-gray-50">
      {/* Header con menú hamburguesa */}
      <header className="bg-white border-b">
        <div className="px-4 h-16 flex items-center justify-between">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                {adminMenuItems.map((item) => (
                  <div key={item.title}>
                    {item.href ? (
                      <Link href={item.href}>
                        <a
                          className={`block px-4 py-2 rounded-lg ${
                            isActive(item.href)
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-gray-100"
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          {item.title}
                        </a>
                      </Link>
                    ) : (
                      <>
                        <div className="px-4 py-2 font-semibold">{item.title}</div>
                        <div className="ml-4 flex flex-col gap-1">
                          {item.items?.map((subItem) => (
                            <Link key={subItem.href} href={subItem.href}>
                              <a
                                className={`block px-4 py-2 rounded-lg ${
                                  isActive(subItem.href)
                                    ? "bg-primary text-primary-foreground"
                                    : "hover:bg-gray-100"
                                }`}
                                onClick={() => setIsOpen(false)}
                              >
                                {subItem.title}
                              </a>
                            </Link>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <h1 className="text-xl font-semibold">Panel de Administración</h1>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
