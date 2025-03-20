import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  Package, 
  ChartBar, 
  Clock, 
  Database, 
  FileJson, 
  Settings 
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();
  const isHome = location === "/";
  const isAdmin = location.startsWith("/admin");

  useEffect(() => {
    if (isHome) {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > window.innerHeight - 100);
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      setIsScrolled(true);
    }
  }, [isHome]);

  return (
    <header
      className={`${isHome ? 'fixed' : 'relative'} top-0 py-5 left-0 w-full z-50 transition-colors duration-300 ${
        isScrolled ? "bg-slate-50 shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Social media icons or admin nav dropdown */}
        <div className="flex items-center space-x-4">
          {isAdmin ? (
            // Admin navigation dropdown
            <div className="relative group">
              <button 
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 py-2 px-3 rounded-md border border-gray-200"
              >
                {/* Mostrar el icono de la página actual */}
                {location.includes('/admin/orders') && <Package className="h-4 w-4" />}
                {location.includes('/admin/dashboards') && <ChartBar className="h-4 w-4" />}
                {location.includes('/admin/horarios') && <Clock className="h-4 w-4" />}
                {location.includes('/admin/database') && <Database className="h-4 w-4" />}
                {location.includes('/admin/seeds') && <FileJson className="h-4 w-4" />}
                {location.includes('/admin/settings') && <Settings className="h-4 w-4" />}
                
                {/* Mostrar el texto de la página actual */}
                <span className="text-sm font-medium">
                  {location.includes('/admin/orders') && 'Pedidos'}
                  {location.includes('/admin/dashboards') && 'Dashboards'}
                  {location.includes('/admin/horarios') && 'Horarios'}
                  {location.includes('/admin/database') && 'Base de Datos'}
                  {location.includes('/admin/seeds') && 'Semillas'}
                  {location.includes('/admin/settings') && 'Configuración'}
                </span>
                
                {/* Flecha hacia abajo */}
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>
              
              {/* Menú desplegable */}
              <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 shadow-lg rounded-md w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <Link href="/admin/orders">
                    <a className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Package className="h-4 w-4" />
                      <span>Pedidos</span>
                    </a>
                  </Link>
                  <Link href="/admin/dashboards/orders-overview">
                    <a className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <ChartBar className="h-4 w-4" />
                      <span>Dashboards</span>
                    </a>
                  </Link>
                  <Link href="/admin/horarios">
                    <a className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Clock className="h-4 w-4" />
                      <span>Horarios</span>
                    </a>
                  </Link>
                  <Link href="/admin/database">
                    <a className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Database className="h-4 w-4" />
                      <span>Base de Datos</span>
                    </a>
                  </Link>
                  <Link href="/admin/seeds">
                    <a className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <FileJson className="h-4 w-4" />
                      <span>Semillas</span>
                    </a>
                  </Link>
                  <Link href="/admin/settings">
                    <a className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <Settings className="h-4 w-4" />
                      <span>Configuración</span>
                    </a>
                  </Link>
                  <div className="border-t border-gray-200 my-1"></div>
                  <Link href="/">
                    <a className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                      </svg>
                      <span>Volver al Sitio</span>
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            // Social media icons for public section
            <>
              <a
                href="https://www.facebook.com/people/Asador-la-morenica/100064982920008/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={
                    isScrolled
                      ? "/img/corporativa/svg/facebook.svg"
                      : "/img/corporativa/svg/facebook-b.svg"
                  }
                  alt="Facebook"
                  className="h-6 w-6"
                />
              </a>
              <a
                href="https://www.instagram.com/asadolamorenica/?hl=es"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={
                    isScrolled
                      ? "/img/corporativa/svg/instagram.svg"
                      : "/img/corporativa/svg/instagram-b.svg"
                  }
                  alt="Instagram"
                  className="h-6 w-6"
                />
              </a>
            </>
          )}
        </div>

        {/* Centered logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <Link href="/">
            <a>
              <img
                src={
                  isScrolled
                    ? "/img/corporativa/logo-negro.png"
                    : "/img/corporativa/logo-blanco.png"
                }
                alt="Asador La Morenica"
                className="h-20 transition-opacity duration-300 pt-2"
              />
            </a>
          </Link>
        </div>

        {/* Navigation menu and order button on the right */}
        <div className="flex items-center space-x-4">
          {!isAdmin && (
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={isScrolled ? "text-black" : "text-white"}
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-8">
                  <Link href="/products">
                    <a className="text-lg">Productos</a>
                  </Link>
                  <Link href="/about">
                    <a className="text-lg">Nosotros</a>
                  </Link>
                  <Link href="/contact">
                    <a className="text-lg">Contacto</a>
                  </Link>
                  <Link href="/admin">
                    <a className="text-lg">Admin</a>
                  </Link>
                  <Link href="/order">
                    <Button className="w-full bg-[#8B4513] text-white hover:bg-[#6d3610]">
                      Hacer Pedido
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}