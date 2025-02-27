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
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/">
            <a className="text-2xl font-bold">Asador La Morenica</a>
          </Link>

          <NavigationMenu>
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
            <Button>Hacer Pedido</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
