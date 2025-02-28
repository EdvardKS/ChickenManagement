import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import FloatingContact from "@/components/floating-contact";

import Home from "@/pages/home";
import Products from "@/pages/products";
import Order from "@/pages/order";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import AdminHome from "@/pages/admin/index";
import AdminProducts from "@/pages/admin/products";
import AdminOrders from "@/pages/admin/orders";
import AdminStock from "@/pages/admin/stock";
import AdminDatabase from "@/pages/admin/database"; // Agregamos la nueva página
import NotFound from "@/pages/not-found";

// Update document metadata for SEO
document.title = "Asador La Morenica | Pollos Asados a la Leña en Villena";
const metaDescription = document.createElement('meta');
metaDescription.name = 'description';
metaDescription.content = 'Los mejores pollos asados a la leña en Villena y comarca. Tradición y sabor único desde hace más de 20 años. Fusión de cocina española y armenia.';
document.head.appendChild(metaDescription);

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
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
          <Route path="/admin">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <AdminHome />
            </div>
          </Route>
          <Route path="/admin/products">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <AdminProducts />
            </div>
          </Route>
          <Route path="/admin/orders">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <AdminOrders />
            </div>
          </Route>
          <Route path="/admin/stock">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <AdminStock />
            </div>
          </Route>
          <Route path="/admin/database">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <AdminDatabase />
            </div>
          </Route>
          <Route>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <NotFound />
            </div>
          </Route>
        </Switch>
      </main>
      <Footer />
      <FloatingContact />
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