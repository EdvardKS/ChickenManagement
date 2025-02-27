import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { useState, useEffect } from "react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > window.innerHeight - 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`nav-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container flex justify-between items-center">
        <div className="col-4 col-lg-5">
          <button className="btn-menu md:hidden" type="button" aria-label="Menu">
            <span>&nbsp;</span><span>&nbsp;</span><span>&nbsp;</span>
          </button>
        </div>

        <div className="col-4 col-lg-2 text-center">
          <Link href="/">
            <a className="block">
              <img 
                src={isScrolled ? "/img/corporativa/slogan-negro.png" : "/img/corporativa/slogan-blanco.png"}
                alt="Asador La Morenica" 
                className="h-20 mx-auto transition-opacity duration-300"
              />
            </a>
          </Link>
        </div>

        <div className="col-4 col-lg-5 flex justify-end items-center">
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="gap-8">
              <NavigationMenuItem>
                <Link href="/products">
                  <NavigationMenuLink className="nav-link">
                    Productos
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/about">
                  <NavigationMenuLink className="nav-link">
                    Nosotros
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/contact">
                  <NavigationMenuLink className="nav-link">
                    Contacto
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/admin">
                  <NavigationMenuLink className="nav-link">
                    Admin
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <Link href="/order">
            <Button 
              className="ml-8"
              style={{ 
                backgroundColor: isScrolled ? '#8B4513' : 'transparent',
                border: isScrolled ? 'none' : '2px solid white',
                color: 'white'
              }}
            >
              Hacer Pedido
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}