import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Clock, ChefHat, MapPin, Phone, Users, Utensils, Calendar, Star } from "lucide-react";
import { motion } from "framer-motion";
import type { BusinessHours } from "@shared/schema";
import HeroBanner from "@/components/hero-banner/HeroBanner";

export default function Home() {
  const { data: businessHours } = useQuery<BusinessHours[]>({ 
    queryKey: ['/api/business-hours'] 
  });

  return (
    <div className="min-h-screen bg-white">
      <HeroBanner />

      {/* Horno de Leña Tradicional */}
      <section className="w-full py-16 md:py-20 lg:py-24 bg-[#1A0F0F] text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 lg:gap-16">
            <div className="flex-1 space-y-6 md:space-y-8 text-center md:text-left max-w-xl">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-dancing">Tradición del Horno de Leña</h2>
              <p className="text-base md:text-lg lg:text-xl leading-relaxed text-gray-300">
                Nuestro horno de leña, el corazón de nuestra cocina, imparte ese sabor inconfundible que solo la cocción tradicional puede lograr. 
                La madera cuidadosamente seleccionada y el control preciso de la temperatura nos permiten conseguir ese punto exacto de cocción 
                que caracteriza a nuestros pollos asados.
              </p>

              {/* Métricas */}
              <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-xl mx-auto md:mx-0">
                <div className="text-center p-2 md:p-4">
                  <div className="text-3xl md:text-4xl font-bold text-[#D4AF37]">20+</div>
                  <div className="text-xs md:text-sm text-gray-400 mt-2">Años de Experiencia</div>
                </div>
                <div className="text-center p-2 md:p-4">
                  <div className="text-3xl md:text-4xl font-bold text-[#D4AF37]">100%</div>
                  <div className="text-xs md:text-sm text-gray-400 mt-2">Leña Natural</div>
                </div>
                <div className="text-center p-2 md:p-4">
                  <div className="text-3xl md:text-4xl font-bold text-[#D4AF37]">5⭐</div>
                  <div className="text-xs md:text-sm text-gray-400 mt-2">Valoración</div>
                </div>
              </div>
            </div>

            <div className="flex-1 max-w-md lg:max-w-lg xl:max-w-xl w-full px-4 md:px-0">
              <img 
                src="/img/aburrido.svg" 
                alt="Nuestro horno de leña tradicional" 
                className="rounded-xl shadow-2xl w-full h-auto"
              /> 
            </div>
          </div>
        </div>
      </section>

      {/* Especialidades */}
      <section className="py-16 md:py-20 lg:py-24 bg-[#2C2C2C] text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-7xl mx-auto space-y-8 md:space-y-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-dancing text-center">Nuestras Especialidades</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
              {[
                {
                  title: "Menú 1",
                  description: "Medio pollo con una ración de patatas y 4 Croquetas",
                  price: "8€"
                },
                {
                  title: "Menú 2",
                  description: "Un pollo con una ración de patatas y 4 Croquetas",
                  price: "12€"
                },
                {
                  title: "Menú 3",
                  description: "Un pollo y medio con tres raciones de patatas y 6 Croquetas",
                  price: "20€"
                }
              ].map((menu, index) => (
                <div key={index} className="text-center space-y-4 md:space-y-6">
                  <div className="overflow-hidden rounded-xl aspect-video">
                    <img 
                      src="/img/aburrido.svg" 
                      alt={menu.title} 
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    />
                  </div>
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-dancing text-[#D4AF37]">{menu.title}</h3>
                  <p className="text-sm md:text-base lg:text-lg text-gray-300">{menu.description}</p>
                  <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#D4AF37]">{menu.price}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Servicios Especiales */}
      <section className="py-16 md:py-20 lg:py-24 bg-[#2C2C2C] text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-7xl mx-auto space-y-8 md:space-y-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-dancing text-center">Servicios Especiales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12">
              {[
                {
                  icon: Utensils,
                  title: "Catering",
                  description: "Llevamos nuestros deliciosos platos a tu evento, manteniendo la misma calidad y sabor."
                },
                {
                  icon: Users,
                  title: "Eventos Privados",
                  description: "Organizamos tu celebración con un servicio personalizado y menús a medida."
                },
                {
                  icon: Calendar,
                  title: "Reservas Especiales",
                  description: "Reserva nuestro espacio para tus ocasiones especiales con atención exclusiva."
                }
              ].map((service, index) => (
                <div 
                  key={index} 
                  className="p-6 md:p-8 border border-gray-700 rounded-xl hover:border-[#D4AF37] transition-colors duration-300"
                >
                  <service.icon className="h-10 w-10 md:h-12 md:w-12 text-[#D4AF37] mx-auto mb-4 md:mb-6" />
                  <h3 className="text-xl md:text-2xl font-dancing mb-3 md:mb-4 text-center">{service.title}</h3>
                  <p className="text-sm md:text-base text-gray-400 text-center">{service.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Información */}
      <section className="py-16 md:py-20 lg:py-24 bg-[#F5F5F5]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                icon: ChefHat,
                title: "Cocina Tradicional",
                content: "Especialistas en pollos asados a la leña con recetas tradicionales y sabor único."
              },
              {
                icon: Clock,
                title: "Horario",
                content: businessHours?.map(hour => (
                  <div key={hour.id} className="flex justify-between items-center text-sm md:text-base">
                    <span>{getDayName(hour.dayOfWeek)}</span>
                    <span>{hour.openTime} - {hour.closeTime}</span>
                  </div>
                ))
              },
              {
                icon: MapPin,
                title: "Ubicación",
                content: (
                  <>
                    <p className="text-sm md:text-base">C/ Celada 72, Villena (03400) Alicante</p>
                    <p className="flex items-center justify-center gap-2 mt-2 text-sm md:text-base">
                      <Phone className="h-4 w-4" />
                      965813907 / 654027015
                    </p>
                  </>
                )
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="text-center space-y-4 md:space-y-6 p-4 md:p-6 bg-white rounded-xl shadow-lg"
              >
                <item.icon className="h-12 w-12 md:h-16 md:w-16 text-[#8B4513] mx-auto" />
                <h3 className="text-xl md:text-2xl font-dancing text-[#8B4513]">{item.title}</h3>
                <div className="text-gray-600">{item.content}</div>
              </motion.div>
            ))}
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