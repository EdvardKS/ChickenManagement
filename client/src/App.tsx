import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import FloatingContact from "@/components/floating-contact";
import AdminLayout from "@/components/layout/admin-layout";

// Public pages
import Home from "@/pages/home";
import Products from "@/pages/products";
import Order from "@/pages/order";
import About from "@/pages/about";
import Contact from "@/pages/contact";

// Admin pages
import AdminHome from "@/pages/admin/index";
import AdminProducts from "@/pages/admin/products";
import AdminOrders from "@/pages/admin/orders";
import AdminSettings from "@/pages/admin/settings";

// Dashboard pages
import DashboardLayout from "@/pages/admin/dashboards/layout";
import OrdersOverview from "@/pages/admin/dashboards/orders-overview";
import StockLevels from "@/pages/admin/dashboards/stock-levels";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRoute && <Header />}
      <main className={isAdminRoute ? "flex-1" : ""}>
        <Switch>
          {/* Public routes */}
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

          {/* Admin routes */}
          <Route path="/admin/dashboards/:page*">
            <AdminLayout>
              <DashboardLayout>
                <Switch>
                  <Route path="/admin/dashboards/orders-overview" component={OrdersOverview} />
                  <Route path="/admin/dashboards/stock-levels" component={StockLevels} />
                  <Route component={NotFound} />
                </Switch>
              </DashboardLayout>
            </AdminLayout>
          </Route>

          <Route path="/admin/:page*">
            <AdminLayout>
              <Switch>
                <Route path="/admin" component={AdminHome} />
                <Route path="/admin/products" component={AdminProducts} />
                <Route path="/admin/orders" component={AdminOrders} />
                <Route path="/admin/settings" component={AdminSettings} />
                <Route component={NotFound} />
              </Switch>
            </AdminLayout>
          </Route>

          <Route component={NotFound} />
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