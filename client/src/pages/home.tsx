import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Clock, ChefHat } from "lucide-react";
import type { BusinessHours } from "@shared/schema";

export default function Home() {
  const { data: businessHours } = useQuery<BusinessHours[]>({ 
    queryKey: ['/api/business-hours']
  });

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center bg-gradient-to-r from-orange-600 to-red-700">
        <div className="text-center text-white space-y-6">
          <h1 className="text-5xl font-bold">Asador La Morenica</h1>
          <p className="text-xl">Los mejores pollos a la brasa en Villena</p>
          <Link href="/order">
            <Button size="lg" className="bg-white text-red-700 hover:bg-gray-100">
              Hacer Pedido
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-8">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <ChefHat className="h-12 w-12 text-red-600" />
            <h3 className="text-xl font-bold">Cocina Tradicional</h3>
            <p>Pollos asados a la leña con recetas tradicionales y sabor único.</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <Clock className="h-12 w-12 text-red-600" />
            <h3 className="text-xl font-bold">Horario de Apertura</h3>
            {businessHours?.map(hour => (
              <div key={hour.id} className="flex justify-between">
                <span>{getDayName(hour.dayOfWeek)}</span>
                <span>{hour.openTime} - {hour.closeTime}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <ChefHat className="h-12 w-12 text-red-600" />
            <h3 className="text-xl font-bold">Menús Especiales</h3>
            <p>Descubre nuestros menús especiales y combinaciones.</p>
            <Link href="/products">
              <Button variant="outline" className="w-full">Ver Menús</Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function getDayName(day: number): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[day];
}
