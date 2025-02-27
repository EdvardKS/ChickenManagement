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
    <div className="space-y-8">
      {/* Hero Video Section - Full Width */}
      <figure className="hero-banner hero-banner-heading-valign-middle hero-banner-heading-sm">
        <div className="hero-banner-image">
          <div className="hero-banner-image-placeholder" uk-parallax="scale: 1.2">
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
          </div>
        </div>
        <figcaption>
          <div className="hero-banner-body">
            <div className="container">
              <h1>Los mejores pollos a la brasa</h1>
              <ul className="hero-banner-btns d-lg-none">
                <li>
                  <Link href="/order">
                    <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                      Hacer Pedido
                    </Button>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </figcaption>
      </figure>

      {/* Sobre Nosotros */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-24"
      >
        <div className="container">
          <figure className="mb-16">
            <img 
              src="/img/corporativa/about-image.jpg"
              alt="Nuestro asador"
              className="w-full max-w-4xl mx-auto rounded-lg shadow-xl"
            />
          </figure>
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-6xl font-bold">Conocenos</h2>
            <div className="prose prose-lg mx-auto">
              <p className="text-xl leading-relaxed">
                Llevamos más de 20 años en Villena y comarca, orgullosos de ser un referente 
                en la zona gracias a nuestro horno de leña para asar pollos, lo que les 
                confiere un sabor inigualable y una textura distinta.
              </p>
              <p className="text-xl leading-relaxed">
                En Asador La Morenica encontrarás una gran variedad de platos españoles y 
                de nuestra propia cultura armenia, que fusionamos para ofrecerte una 
                experiencia gastronómica única.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features Grid */}
      <section className="bg-gray-900 text-white py-24">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center space-y-4"
            >
              <ChefHat className="h-16 w-16 text-orange-400 mx-auto" />
              <h3 className="text-3xl">Cocina Tradicional</h3>
              <p className="text-lg text-gray-300">
                Especialistas en pollos asados a la leña con recetas tradicionales 
                y sabor único. Fusionamos la cocina española y armenia.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center space-y-4"
            >
              <Clock className="h-16 w-16 text-orange-400 mx-auto" />
              <h3 className="text-3xl">Horario</h3>
              {businessHours?.map(hour => (
                <div key={hour.id} className="flex justify-between text-lg text-gray-300">
                  <span>{getDayName(hour.dayOfWeek)}</span>
                  <span>{hour.openTime} - {hour.closeTime}</span>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-center space-y-4"
            >
              <MapPin className="h-16 w-16 text-orange-400 mx-auto" />
              <h3 className="text-3xl">Ubicación</h3>
              <p className="text-lg text-gray-300">
                C/ Celada 72, Villena (03400) Alicante
              </p>
              <p className="flex items-center justify-center gap-2 text-lg text-gray-300">
                <Phone className="h-4 w-4" />
                965813907 / 654027015
              </p>
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
        className="py-24"
      >
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-6xl font-bold">Calidad y Tradición</h2>
            <p className="text-xl leading-relaxed">
              Nos importa que te sientas como en casa, por eso te recibiremos con una 
              sonrisa y un trato cercano y amable. Nos encanta compartir nuestra pasión 
              por la buena comida y la hospitalidad con todos nuestros clientes, y 
              estamos seguros de que en cada visita te sentirás parte de la familia.
            </p>
            <p className="text-2xl font-semibold text-orange-600">
              ¡Te esperamos para que descubras todo lo que nuestra cocina tiene para ofrecerte!
            </p>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

function getDayName(day: number): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[day];
}