import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > window.innerHeight - 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Social media icons on the left */}
        <div className="flex items-center space-x-4">
          <a
            href="https://www.facebook.com/people/Asador-la-morenica/100064982920008/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={
                isScrolled
                  ? "/img/corporativa/svg/facebook-b.svg"
                  : "/img/corporativa/svg/facebook.svg"
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
                  ? "/img/corporativa/svg/instagram-b.svg"
                  : "/img/corporativa/svg/instagram.svg"
              }
              alt="Instagram"
              className="h-6 w-6"
            />
          </a>
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
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/order">
            <Button
              className={`ml-4 ${
                isScrolled
                  ? "bg-[#8B4513] text-white border-none"
                  : "bg-transparent border-2 border-white text-white"
              }`}
            >
              Hacer Pedido
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}