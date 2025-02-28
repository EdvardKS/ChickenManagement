import { Switch, Route } from "wouter";
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
  const isAdminRoute = window.location.pathname.startsWith("/admin");

  if (isAdminRoute) {
    return (
      <AdminLayout>
        <Switch>
          <Route path="/admin" component={AdminHome} />
          <Route path="/admin/orders" component={AdminOrders} />
          <Route path="/admin/products" component={AdminProducts} />
          <Route path="/admin/settings" component={AdminSettings} />
          <Route path="/admin/dashboards/:page">
            <DashboardLayout>
              <Switch>
                <Route path="/admin/dashboards/orders-overview" component={OrdersOverview} />
                <Route path="/admin/dashboards/stock-levels" component={StockLevels} />
                <Route component={NotFound} />
              </Switch>
            </DashboardLayout>
          </Route>
          <Route component={NotFound} />
        </Switch>
      </AdminLayout>
    );
  }

  return (
    <>
      <Header />
      <main>
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
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <FloatingContact />
    </>
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