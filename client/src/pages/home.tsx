import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Clock, ChefHat, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";
import type { BusinessHours } from "@shared/schema";

export default function Home() {
  const { data: businessHours } = useQuery<BusinessHours[]>({ 
    queryKey: ['/api/business-hours'] 
  });

  return (
    <div className="space-y-12">
      {/* Hero Video Section - Full Width */}
      <section className="relative h-screen w-screen -mt-[80px]">
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
          <div className="container mx-auto h-full flex items-center justify-center text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl text-white space-y-8"
            >
              <h1 className="text-7xl font-bold text-shadow">
                Asador la Morenica
                <span className="block text-4xl mt-4 text-orange-400">En horno de leña</span>
              </h1>
              <p className="text-2xl font-light">
                Los mejores pollos a la brasa en Villena y alrededores. Disfruta de nuestra cocina en Villena, Biar, Almansa, Caudete y más.
              </p>
              <div className="flex gap-6 justify-center">
                <Link href="/order">
                  <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-lg px-8">
                    Hacer Pedido
                  </Button>
                </Link>
                <Link href="/products">
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 text-lg px-8">
                    Ver Menú
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sobre Nosotros */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4"
      >
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-5xl font-bold text-orange-600">Conocenos</h2>
          <div className="prose prose-lg mx-auto">
            <p className="text-xl leading-relaxed">
              Llevamos más de 20 años en Villena y comarca, orgullosos de ser un referente 
              en la zona gracias a nuestro horno de leña para asar pollos, lo que les 
              confiere un sabor inigualable y una textura distinta.
            </p>
            <p className="text-xl leading-relaxed">
              En Asador La Morenica encontrarás una gran variedad de platos españoles y 
              de nuestra propia cultura armenia, que fusionamos para ofrecerte una 
              experiencia gastronómica única. Desde sabrosas tapas hasta deliciosas 
              especialidades armenias, nuestra carta es un viaje culinario que no te 
              dejará indiferente.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Features Grid */}
      <section className="bg-gradient-to-b from-orange-50 to-transparent py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-white/80 backdrop-blur">
                <CardContent className="pt-6 space-y-4">
                  <ChefHat className="h-12 w-12 text-orange-600" />
                  <h3 className="text-2xl font-bold">Cocina Tradicional</h3>
                  <p className="text-lg">
                    Especialistas en pollos asados a la leña con recetas tradicionales 
                    y sabor único. Fusionamos la cocina española y armenia.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="bg-white/80 backdrop-blur">
                <CardContent className="pt-6 space-y-4">
                  <Clock className="h-12 w-12 text-orange-600" />
                  <h3 className="text-2xl font-bold">Horario de Apertura</h3>
                  {businessHours?.map(hour => (
                    <div key={hour.id} className="flex justify-between text-lg">
                      <span>{getDayName(hour.dayOfWeek)}</span>
                      <span>{hour.openTime} - {hour.closeTime}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className="bg-white/80 backdrop-blur">
                <CardContent className="pt-6 space-y-4">
                  <MapPin className="h-12 w-12 text-orange-600" />
                  <h3 className="text-2xl font-bold">Ubicación</h3>
                  <p className="text-lg">C/ Celada 72, Villena (03400) Alicante</p>
                  <p className="flex items-center gap-2 text-lg">
                    <Phone className="h-4 w-4" />
                    965813907 / 654027015
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Calidad y Tradición */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4"
      >
        <div className="max-w-4xl mx-auto prose prose-lg">
          <h2 className="text-center text-5xl font-bold mb-8 text-orange-600">Calidad y Tradición</h2>
          <p className="text-xl leading-relaxed">
            Nos importa que te sientas como en casa, por eso te recibiremos con una 
            sonrisa y un trato cercano y amable. Nos encanta compartir nuestra pasión 
            por la buena comida y la hospitalidad con todos nuestros clientes, y 
            estamos seguros de que en cada visita te sentirás parte de la familia.
          </p>
          <p className="text-center text-2xl font-semibold text-orange-600">
            ¡Te esperamos para que descubras todo lo que nuestra cocina tiene para ofrecerte!
          </p>
        </div>
      </motion.section>
    </div>
  );
}

function getDayName(day: number): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[day];
}