import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

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

        {/* Centered logo with increased size */}
        <div className="flex-1 text-center">
          <Link href="/">
            <a>
              <img
                src={
                  isScrolled
                    ? "/img/corporativa/logo-negro.png"
                    : "/img/corporativa/logo-blanco.png"
                }
                alt="Asador La Morenica"
                className="h-20 mx-auto transition-opacity duration-300 pt-2"
              />
            </a>
          </Link>
        </div>

        {/* Navigation menu and order button on the right */}
        <div className="flex items-center space-x-6">
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="flex space-x-6">
              <NavigationMenuItem>
                <Link href="/products">
                  <NavigationMenuLink
                    className={`nav-link ${
                      isScrolled ? "text-black" : "text-white"
                    }`}
                  >
                    Productos
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/about">
                  <NavigationMenuLink
                    className={`nav-link ${
                      isScrolled ? "text-black" : "text-white"
                    }`}
                  >
                    Nosotros
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/contact">
                  <NavigationMenuLink
                    className={`nav-link ${
                      isScrolled ? "text-black" : "text-white"
                    }`}
                  >
                    Contacto
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/admin">
                  <NavigationMenuLink
                    className={`nav-link ${
                      isScrolled ? "text-black" : "text-white"
                    }`}
                  >
                    Admin
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

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