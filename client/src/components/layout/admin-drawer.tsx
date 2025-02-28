import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Link, useLocation } from "wouter";

const menuItems = [
  { href: "/admin", label: "Panel Principal" },
  { href: "/admin/orders", label: "Pedidos" },
  { href: "/admin/products", label: "Productos" },
  { href: "/admin/dashboards/orders-overview", label: "Dashboards" },
  { href: "/admin/settings", label: "Configuración" },
];

export default function AdminDrawer() {
  const [location] = useLocation();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 font-poppins">
        <nav className="flex flex-col gap-2 mt-8">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  location === item.href
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {item.label}
              </a>
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}