import { Switch, Route, useLocation, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import FloatingContact from "@/components/floating-contact";
import AdminLayout from "@/components/layout/admin-layout";
import { AuthProvider, ProtectedRoute, HaykakanRoute, useAuth } from "@/components/auth/auth-provider";

import Home from "@/pages/home";
import Products from "@/pages/products"; 
import Productos from "@/pages/productos";
import Order from "@/pages/order";
import Nosotros from "@/pages/nosotros";
import Contacto from "@/pages/contacto";
import Login from "@/pages/auth/login";
import AdminHome from "@/pages/admin/index";
import AdminProducts from "@/pages/admin/products";
import AdminOrders from "@/pages/admin/orders";
import AdminDatabase from "@/pages/admin/database";
import AdminSettings from "@/pages/admin/settings";
import AdminSeeds from "@/pages/admin/seeds";
import AdminHorarios from "@/pages/admin/horarios";
import FeaturedMenus from "@/pages/admin/featured-menus";
import FiestasAdminPage from "@/pages/admin/fiestas";
import FesteroPage from "@/pages/fiestas";
import DashboardLayout from "@/pages/admin/dashboards/layout";
import OrdersOverview from "@/pages/admin/dashboards/orders-overview";
import StockLevels from "@/pages/admin/dashboards/stock-levels";
import AdminUsers from "@/pages/admin/users";
import NotFound from "@/pages/not-found";
import { ReactNode } from "react";

// SEO metadata
document.title = "Asador La Morenica | Pollos Asados a la Leña en Villena";
const metaDescription = document.createElement('meta');
metaDescription.name = 'description';
metaDescription.content = 'Los mejores pollos asados a la leña en Villena y comarca. Tradición y sabor único desde hace más de 20 años. Fusión de cocina española y armenia.';
document.head.appendChild(metaDescription);

// Componente de protección para rutas de festeros
function FesteroRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isFestero, isLoading } = useAuth();
  const [, navigate] = useLocation();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  if (!isAuthenticated) {
    // Redirigir a login si no está autenticado
    navigate("/login");
    return null;
  }

  if (!isFestero) {
    // Si no es festero, redirigir según el rol
    navigate("/admin");
    return null;
  }

  return <>{children}</>;
}

// Componente de protección para rutas de admin (solo haykakan)
function AdminOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isHaykakan, isLoading } = useAuth();
  const [, navigate] = useLocation();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  }

  if (!isAuthenticated) {
    // Redirigir a login si no está autenticado
    navigate("/login");
    return null;
  }

  if (!isHaykakan) {
    // Si es festero, redirigir a su vista
    navigate("/fiestas");
    return null;
  }

  return <>{children}</>;
}

function PublicRoutes() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/productos">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <Productos />
            </div>
          </Route>
          <Route path="/products">
            <Redirect to="/productos" />
          </Route>
          <Route path="/encargar">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <Order />
            </div>
          </Route>
          <Route path="/order">
            <Redirect to="/encargar" />
          </Route>
          <Route path="/nosotros">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <Nosotros />
            </div>
          </Route>
          <Route path="/contacto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <Contacto />
            </div>
          </Route>
          <Route path="/login" component={Login} />
          <Route path="/fiestas">
            <FesteroRoute>
              <div className="min-h-screen bg-gray-50">
                <Header />
                <FesteroPage />
                <Footer />
              </div>
            </FesteroRoute>
          </Route>
          {/* Mantener rutas anteriores para compatibilidad */}
          <Route path="/about">
            <Redirect to="/nosotros" />
          </Route>
          <Route path="/contact">
            <Redirect to="/contacto" />
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <FloatingContact />
    </div>
  );
}

function AdminRoutes() {
  return (
    <AdminOnlyRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <AdminLayout>
          <Switch>
            <Route path="/admin">
              <Redirect to="/admin/orders" />
            </Route>
            <Route path="/admin/orders">
              <HaykakanRoute>
                <AdminOrders />
              </HaykakanRoute>
            </Route>
            <Route path="/admin/horarios">
              <HaykakanRoute>
                <AdminHorarios />
              </HaykakanRoute>
            </Route>
            <Route path="/admin/database">
              <HaykakanRoute>
                <AdminDatabase />
              </HaykakanRoute>
            </Route>
            <Route path="/admin/settings">
              <HaykakanRoute>
                <AdminSettings />
              </HaykakanRoute>
            </Route>
            <Route path="/admin/seeds">
              <HaykakanRoute>
                <AdminSeeds />
              </HaykakanRoute>
            </Route>
            <Route path="/admin/featured-menus">
              <HaykakanRoute>
                <FeaturedMenus />
              </HaykakanRoute>
            </Route>
            <Route path="/admin/users">
              <HaykakanRoute>
                <AdminUsers />
              </HaykakanRoute>
            </Route>
            <Route path="/admin/fiestas">
              <HaykakanRoute>
                <FiestasAdminPage />
              </HaykakanRoute>
            </Route>
            <Route path="/admin/dashboards/:dashboard*">
              <HaykakanRoute>
                <DashboardLayout>
                  <Switch>
                    <Route path="/admin/dashboards/orders-overview">
                      <HaykakanRoute>
                        <OrdersOverview />
                      </HaykakanRoute>
                    </Route>
                    <Route path="/admin/dashboards/stock-levels">
                      <HaykakanRoute>
                        <StockLevels />
                      </HaykakanRoute>
                    </Route>
                  </Switch>
                </DashboardLayout>
              </HaykakanRoute>
            </Route>
            <Route component={NotFound} />
          </Switch>
        </AdminLayout>
      </div>
    </AdminOnlyRoute>
  );
}

function Router() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith("/admin");

  return isAdminRoute ? <AdminRoutes /> : <PublicRoutes />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;