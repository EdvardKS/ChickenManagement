import { Separator } from "@/components/ui/separator";
import { Link, useLocation } from "wouter";

const dashboardGroups = [
  {
    name: "Ventas y Pedidos",
    items: [
      { id: "orders-overview", label: "Vista General de Pedidos", path: "/admin/dashboards/orders-overview" },
      { id: "daily-sales", label: "Ventas Diarias", path: "/admin/dashboards/daily-sales" },
      { id: "customer-analysis", label: "Análisis de Clientes", path: "/admin/dashboards/customer-analysis" },
    ]
  },
  {
    name: "Gestión de Stock",
    items: [
      { id: "stock-levels", label: "Niveles de Stock", path: "/admin/dashboards/stock-levels" },
      { id: "stock-history", label: "Historial de Stock", path: "/admin/dashboards/stock-history" },
      { id: "stock-predictions", label: "Predicciones de Stock", path: "/admin/dashboards/stock-predictions" },
    ]
  },
  {
    name: "Productos y Categorías",
    items: [
      { id: "product-performance", label: "Rendimiento de Productos", path: "/admin/dashboards/product-performance" },
      { id: "category-analysis", label: "Análisis por Categoría", path: "/admin/dashboards/category-analysis" },
      { id: "price-analysis", label: "Análisis de Precios", path: "/admin/dashboards/price-analysis" },
    ]
  },
  {
    name: "Análisis de Horarios",
    items: [
      { id: "peak-hours", label: "Horas Pico", path: "/admin/dashboards/peak-hours" },
      { id: "weekly-patterns", label: "Patrones Semanales", path: "/admin/dashboards/weekly-patterns" },
      { id: "seasonal-trends", label: "Tendencias Estacionales", path: "/admin/dashboards/seasonal-trends" },
    ]
  },
  {
    name: "Facturación",
    items: [
      { id: "revenue-metrics", label: "Métricas de Ingresos", path: "/admin/dashboards/revenue-metrics" },
      { id: "invoice-analysis", label: "Análisis de Facturas", path: "/admin/dashboards/invoice-analysis" },
      { id: "payment-patterns", label: "Patrones de Pago", path: "/admin/dashboards/payment-patterns" },
    ]
  }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const currentPath = location.split("/").pop();

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-10 pb-16 font-poppins">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Dashboards</h2>
        <p className="text-muted-foreground">
          Visualizaciones y análisis detallados del rendimiento del negocio
        </p>
      </div>
      <Separator />
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/4">
          <nav className="space-y-6">
            {dashboardGroups.map((group) => (
              <div key={group.name} className="space-y-2">
                <h3 className="font-semibold text-lg">{group.name}</h3>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <Link key={item.id} href={item.path}>
                      <a className={`block px-3 py-2 rounded-lg text-sm ${
                        currentPath === item.id 
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}>
                        {item.label}
                      </a>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
        <div className="flex-1">
          <div className="h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}