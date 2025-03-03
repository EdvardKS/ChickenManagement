import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import FloatingContact from "@/components/floating-contact";

import Home from "@/pages/home"; 
import Order from "@/pages/order";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import AdminHome from "@/pages/admin/index"; 
import AdminOrders from "@/pages/admin/orders";
import AdminDatabase from "@/pages/admin/database";
import DashboardLayout from "@/pages/admin/dashboards/layout";
import OrdersOverview from "@/pages/admin/dashboards/orders-overview";
import StockLevels from "@/pages/admin/dashboards/stock-levels";
import NotFound from "@/pages/not-found";
import AdminSettings from "@/pages/admin/settings";
import AdminSeeds from "@/pages/admin/seeds"; // Added import

// Update document metadata for SEO
document.title = "Asador La Morenica | Pollos Asados a la Leña en Villena";
const metaDescription = document.createElement('meta');
metaDescription.name = 'description';
metaDescription.content = 'Los mejores pollos asados a la leña en Villena y comarca. Tradición y sabor único desde hace más de 20 años. Fusión de cocina española y armenia.';
document.head.appendChild(metaDescription);

function Router() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className={`flex-grow ${isAdminRoute ? 'bg-gray-50' : ''}`}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/products">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <Products />
            </div>
          </Route>
          <Route path="/order">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <Order />
            </div>
          </Route>
          <Route path="/about">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <About />
            </div>
          </Route>
          <Route path="/contact">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <Contact />
            </div>
          </Route>
          {/* Rutas de administración */}
          <Route path="/admin">
            <div className="px-6 py-8">
              <AdminHome />
            </div>
          </Route>
          <Route path="/admin/products">
            <div className="px-6 py-8">
              Aqui va el de horarios
            </div>
          </Route>
          <Route path="/admin/orders">
            <div className="px-6 py-8">
              <AdminOrders />
            </div>
          </Route>
          <Route path="/admin/database">
            <div className="px-6 py-8">
              <AdminDatabase />
            </div>
          </Route>
          <Route path="/admin/settings">
            <div className="px-6 py-8">
              <AdminSettings />
            </div>
          </Route>
          <Route path="/admin/seeds">
            <div className="px-6 py-8">
              <AdminSeeds />
            </div>
          </Route>
          {/* Rutas de dashboards */}
          <Route path="/admin/dashboards/:dashboard*">
            <DashboardLayout>
              <Switch>
                <Route path="/admin/dashboards/orders-overview" component={OrdersOverview} />
                <Route path="/admin/dashboards/stock-levels" component={StockLevels} />
                {/* Más rutas de dashboards se añadirán aquí */}
              </Switch>
            </DashboardLayout>
          </Route>
          <Route>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <NotFound />
            </div>
          </Route>
        </Switch>
      </main>
      {!isAdminRoute && (
        <>
          <Footer />
          <FloatingContact />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;