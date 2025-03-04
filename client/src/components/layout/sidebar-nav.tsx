import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { LucideIcon } from "lucide-react";

interface SidebarNavProps {
  items: {
    title: string;
    href: string;
    icon: LucideIcon;
  }[];
}

export function SidebarNav({ items }: SidebarNavProps) {
  const [location] = useLocation();

  return (
    <ScrollArea className="h-full py-6">
      <nav className="flex flex-col space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={location === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2",
                  location === item.href
                    ? "bg-muted hover:bg-muted"
                    : "hover:bg-transparent hover:underline"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Button>
            </Link>
          );
        })}
      </nav>
    </ScrollArea>
  );
}
