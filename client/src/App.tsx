import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

import Home from "@/pages/home";
import Products from "@/pages/products";
import Order from "@/pages/order";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import AdminHome from "@/pages/admin/index";
import AdminProducts from "@/pages/admin/products";
import AdminOrders from "@/pages/admin/orders";
import AdminStock from "@/pages/admin/stock";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/products" component={Products} />
          <Route path="/order" component={Order} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route path="/admin" component={AdminHome} />
          <Route path="/admin/products" component={AdminProducts} />
          <Route path="/admin/orders" component={AdminOrders} />
          <Route path="/admin/stock" component={AdminStock} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
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
