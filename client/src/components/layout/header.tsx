import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="col-4 col-lg-5">
            <button className="btn-menu md:hidden" type="button" aria-label="Menu">
              <span>&nbsp;</span><span>&nbsp;</span><span>&nbsp;</span>
            </button>
          </div>

          <div className="col-4 col-lg-2 text-center">
            <Link href="/">
              <a className="block">
                <img 
                  src="/img/corporativa/logo-negro-web.png" 
                  alt="Asador La Morenica" 
                  className="h-16 mx-auto"
                />
              </a>
            </Link>
          </div>

          <div className="col-4 col-lg-5 flex justify-end items-center">
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link href="/products">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Productos
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/about">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Nosotros
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/contact">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Contacto
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/admin">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Admin
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <Link href="/order">
              <Button className="ml-4" style={{ backgroundColor: '#8B4513' }}>Hacer Pedido</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}