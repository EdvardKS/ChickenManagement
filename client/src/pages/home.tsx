import { useQuery } from "@tanstack/react-query";
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
      {/* Hero Banner */}
      <figure className="hero-banner">
        <div className="hero-banner-image">
          <video
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            poster="https://asadorlamorenica.com/img/miniatura.jpg"
          >
            <source src="https://asadorlamorenica.com/img/corporativa/sliders/pollos_slider_home.mov" type="video/mp4" />
          </video>
        </div>
        <figcaption>
          <div className="hero-banner-body">
            <h1>Los mejores pollos a la brasa</h1>
            <p className="text-2xl mb-8">Tradición y sabor inigualable en cada bocado</p>
            <div className="hero-banner-btns">
              <Link href="/order">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  Hacer Pedido
                </Button>
              </Link>
            </div>
          </div>
        </figcaption>
      </figure>

      {/* Especialidades */}
      <section className="py-24 bg-[#2C2C2C] text-white">
        <div className="container">
          <motion.div 
            className="max-w-4xl mx-auto text-center space-y-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-dancing mb-8">Nuestras Especialidades</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <img src="/img/menu_uno.jpg" alt="Menú 1" className="rounded-lg shadow-xl mb-4" />
                <h3 className="text-2xl font-dancing text-[#D4AF37]">Menú 1</h3>
                <p>Medio pollo con una ración de patatas y 4 Croquetas</p>
                <p className="text-2xl font-bold text-[#D4AF37]">8€</p>
              </div>
              <div className="text-center space-y-4">
                <img src="/img/menu_dos.jpg" alt="Menú 2" className="rounded-lg shadow-xl mb-4" />
                <h3 className="text-2xl font-dancing text-[#D4AF37]">Menú 2</h3>
                <p>Un pollo con una ración de patatas y 4 Croquetas</p>
                <p className="text-2xl font-bold text-[#D4AF37]">12€</p>
              </div>
              <div className="text-center space-y-4">
                <img src="/img/menu_tres.jpg" alt="Menú 3" className="rounded-lg shadow-xl mb-4" />
                <h3 className="text-2xl font-dancing text-[#D4AF37]">Menú 3</h3>
                <p>Un pollo y medio con tres raciones de patatas y 6 Croquetas</p>
                <p className="text-2xl font-bold text-[#D4AF37]">20€</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sobre Nosotros */}
      <section className="py-24">
        <div className="container">
          <motion.div 
            className="max-w-4xl mx-auto text-center space-y-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-dancing mb-8 text-[#8B4513]">Nuestra Historia</h2>
            <div className="prose prose-lg mx-auto">
              <p>
                Llevamos más de 20 años en Villena y comarca, orgullosos de ser un referente 
                en la zona gracias a nuestro horno de leña para asar pollos, lo que les 
                confiere un sabor inigualable y una textura distinta.
              </p>
              <p>
                En Asador La Morenica encontrarás una fusión única de cocina española y armenia, 
                creando una experiencia gastronómica inolvidable.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Información */}
      <section className="py-24 bg-[#F5F5F5]">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center space-y-4"
            >
              <ChefHat className="h-16 w-16 text-[#8B4513] mx-auto" />
              <h3 className="text-2xl font-dancing">Cocina Tradicional</h3>
              <p className="text-lg">
                Especialistas en pollos asados a la leña con recetas tradicionales 
                y sabor único.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center space-y-4"
            >
              <Clock className="h-16 w-16 text-[#8B4513] mx-auto" />
              <h3 className="text-2xl font-dancing">Horario</h3>
              {businessHours?.map(hour => (
                <div key={hour.id} className="flex justify-between text-lg">
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
              <MapPin className="h-16 w-16 text-[#8B4513] mx-auto" />
              <h3 className="text-2xl font-dancing">Ubicación</h3>
              <p className="text-lg">
                C/ Celada 72, Villena (03400) Alicante
              </p>
              <p className="flex items-center justify-center gap-2 text-lg">
                <Phone className="h-4 w-4" />
                965813907 / 654027015
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

function getDayName(day: number): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[day];
}