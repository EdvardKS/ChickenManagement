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
  Settings,
  ChevronDown,
  Star
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();
  const isHome = location === "/";
  const isAdmin = location.startsWith("/admin");

  // Obtener la sección actual para mostrar en el menú desplegable
  const getCurrentSection = () => {
    if (location.includes('/admin/orders')) {
      return { icon: <Package className="h-4 w-4" />, text: 'Pedidos', path: '/admin/orders' };
    } else if (location.includes('/admin/dashboards')) {
      return { icon: <ChartBar className="h-4 w-4" />, text: 'Dashboards', path: '/admin/dashboards/orders-overview' };
    } else if (location.includes('/admin/horarios')) {
      return { icon: <Clock className="h-4 w-4" />, text: 'Horarios', path: '/admin/horarios' };
    } else if (location.includes('/admin/database')) {
      return { icon: <Database className="h-4 w-4" />, text: 'Base de Datos', path: '/admin/database' };
    } else if (location.includes('/admin/seeds')) {
      return { icon: <FileJson className="h-4 w-4" />, text: 'Semillas', path: '/admin/seeds' };
    } else if (location.includes('/admin/settings')) {
      return { icon: <Settings className="h-4 w-4" />, text: 'Configuración', path: '/admin/settings' };
    } else if (location.includes('/admin/featured-menus')) {
      return { icon: <Star className="h-4 w-4" />, text: 'Menús Destacados', path: '/admin/featured-menus' };
    }
    // Por defecto, mostrar Pedidos
    return { icon: <Package className="h-4 w-4" />, text: 'Pedidos', path: '/admin/orders' };
  };

  const currentSection = getCurrentSection();

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
        {/* Menú de administración o iconos de redes sociales */}
        <div className="flex items-center space-x-4">
          {isAdmin ? (
            // Menú desplegable para sección de administración
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2 py-1 px-3">
                  {currentSection.icon}
                  <span className="ml-2">{currentSection.text}</span>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <Link href="/admin/orders">
                  <DropdownMenuItem className="focus:bg-slate-100 cursor-pointer">
                    <div className="flex items-center space-x-2 w-full">
                      <Package className="h-4 w-4" />
                      <span>Pedidos</span>
                    </div>
                  </DropdownMenuItem>
                </Link>
                <Link href="/admin/dashboards/orders-overview">
                  <DropdownMenuItem className="focus:bg-slate-100 cursor-pointer">
                    <div className="flex items-center space-x-2 w-full">
                      <ChartBar className="h-4 w-4" />
                      <span>Dashboards</span>
                    </div>
                  </DropdownMenuItem>
                </Link>
                <Link href="/admin/featured-menus">
                  <DropdownMenuItem className="focus:bg-slate-100 cursor-pointer">
                    <div className="flex items-center space-x-2 w-full">
                      <Star className="h-4 w-4" />
                      <span>Menús Destacados</span>
                    </div>
                  </DropdownMenuItem>
                </Link>
                <Link href="/admin/horarios">
                  <DropdownMenuItem className="focus:bg-slate-100 cursor-pointer">
                    <div className="flex items-center space-x-2 w-full">
                      <Clock className="h-4 w-4" />
                      <span>Horarios</span>
                    </div>
                  </DropdownMenuItem>
                </Link>
                <Link href="/admin/database">
                  <DropdownMenuItem className="focus:bg-slate-100 cursor-pointer">
                    <div className="flex items-center space-x-2 w-full">
                      <Database className="h-4 w-4" />
                      <span>Base de Datos</span>
                    </div>
                  </DropdownMenuItem>
                </Link>
                <Link href="/admin/seeds">
                  <DropdownMenuItem className="focus:bg-slate-100 cursor-pointer">
                    <div className="flex items-center space-x-2 w-full">
                      <FileJson className="h-4 w-4" />
                      <span>Semillas</span>
                    </div>
                  </DropdownMenuItem>
                </Link>
                <Link href="/admin/settings">
                  <DropdownMenuItem className="focus:bg-slate-100 cursor-pointer">
                    <div className="flex items-center space-x-2 w-full">
                      <Settings className="h-4 w-4" />
                      <span>Configuración</span>
                    </div>
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Iconos de redes sociales para sección pública
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
            <img
              src={
                isScrolled
                  ? "/img/corporativa/logo-negro.png"
                  : "/img/corporativa/logo-blanco.png"
              }
              alt="Asador La Morenica"
              className="h-20 transition-opacity duration-300 pt-2"
            />
          </Link>
        </div>

        {/* Navigation menu on the right - Siempre muestra el menú genérico */}
        <div className="flex items-center space-x-4">
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
                <Link href="/productos">
                  <div className="text-lg cursor-pointer">Productos</div>
                </Link>
                <Link href="/nosotros">
                  <div className="text-lg cursor-pointer">Nosotros</div>
                </Link>
                <Link href="/contacto">
                  <div className="text-lg cursor-pointer">Contacto</div>
                </Link>
                <Link href="/admin">
                  <div className="text-lg cursor-pointer">Admin</div>
                </Link>
                <Link href="/order">
                  <Button className="w-full bg-[#8B4513] text-white hover:bg-[#6d3610]">
                    Hacer Pedido
                  </Button>
                </Link>
                {isAdmin && (
                  <div className="border-t pt-4 mt-4">
                    <Link href="/">
                      <div className="text-lg cursor-pointer">Volver al Sitio</div>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}