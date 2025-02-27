import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Clock, ChefHat, MapPin, Phone } from "lucide-react";
import type { BusinessHours } from "@shared/schema";

export default function Home() {
  const { data: businessHours } = useQuery<BusinessHours[]>({ 
    queryKey: ['/api/business-hours']
  });

  return (
    <div className="space-y-12">
      {/* Hero Video Section */}
      <section className="relative h-[700px] overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          poster="https://asadorlamorenica.com/img/miniatura.jpg"
        >
          <source src="https://asadorlamorenica.com/img/corporativa/sliders/pollos_slider_home.mov" type="video/mp4" />
          Tu navegador no soporta vídeos HTML5
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent">
          <div className="container mx-auto h-full flex items-center">
            <div className="max-w-2xl text-white space-y-6">
              <h1 className="text-6xl font-bold">
                Asador la Morenica
                <span className="block text-3xl mt-2 text-orange-400">En horno de leña</span>
              </h1>
              <p className="text-xl">
                Los mejores pollos a la brasa en Villena y alrededores. Disfruta de nuestra cocina en Villena, Biar, Almansa, Caudete y más.
              </p>
              <div className="flex gap-4">
                <Link href="/order">
                  <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                    Hacer Pedido
                  </Button>
                </Link>
                <Link href="/products">
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                    Ver Menú
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre Nosotros */}
      <section className="container mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold">Conocenos</h2>
          <div className="prose prose-lg mx-auto">
            <p>
              Llevamos más de 20 años en Villena y comarca, orgullosos de ser un referente 
              en la zona gracias a nuestro horno de leña para asar pollos, lo que les 
              confiere un sabor inigualable y una textura distinta.
            </p>
            <p>
              En Asador La Morenica encontrarás una gran variedad de platos españoles y 
              de nuestra propia cultura armenia, que fusionamos para ofrecerte una 
              experiencia gastronómica única. Desde sabrosas tapas hasta deliciosas 
              especialidades armenias, nuestra carta es un viaje culinario que no te 
              dejará indiferente.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-gradient-to-b from-orange-50 to-transparent py-16">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white/80 backdrop-blur">
              <CardContent className="pt-6 space-y-4">
                <ChefHat className="h-12 w-12 text-orange-600" />
                <h3 className="text-xl font-bold">Cocina Tradicional</h3>
                <p>
                  Especialistas en pollos asados a la leña con recetas tradicionales 
                  y sabor único. Fusionamos la cocina española y armenia.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur">
              <CardContent className="pt-6 space-y-4">
                <Clock className="h-12 w-12 text-orange-600" />
                <h3 className="text-xl font-bold">Horario de Apertura</h3>
                {businessHours?.map(hour => (
                  <div key={hour.id} className="flex justify-between">
                    <span>{getDayName(hour.dayOfWeek)}</span>
                    <span>{hour.openTime} - {hour.closeTime}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur">
              <CardContent className="pt-6 space-y-4">
                <MapPin className="h-12 w-12 text-orange-600" />
                <h3 className="text-xl font-bold">Ubicación</h3>
                <p>C/ Celada 72, Villena (03400) Alicante</p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  965813907 / 654027015
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Calidad y Tradición */}
      <section className="container mx-auto">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <h2 className="text-center text-4xl font-bold mb-8">Calidad y Tradición</h2>
          <p>
            Nos importa que te sientas como en casa, por eso te recibiremos con una 
            sonrisa y un trato cercano y amable. Nos encanta compartir nuestra pasión 
            por la buena comida y la hospitalidad con todos nuestros clientes, y 
            estamos seguros de que en cada visita te sentirás parte de la familia.
          </p>
          <p className="text-center text-xl font-semibold text-orange-600">
            ¡Te esperamos para que descubras todo lo que nuestra cocina tiene para ofrecerte!
          </p>
        </div>
      </section>
    </div>
  );
}

function getDayName(day: number): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[day];
}