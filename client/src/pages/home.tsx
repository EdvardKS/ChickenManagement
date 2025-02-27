import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Clock, ChefHat, MapPin, Phone, Users, Utensils, Calendar, Star, Trophy } from "lucide-react";
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
      <section className="py-20 bg-[#1A0F0F] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl space-y-8">
              <h2 className="text-5xl font-dancing">Tradición del Horno de Leña</h2>
              <p className="text-lg leading-relaxed text-gray-300">
                Nuestro horno de leña, el corazón de nuestra cocina, imparte ese sabor inconfundible que solo la cocción tradicional puede lograr. 
                La madera cuidadosamente seleccionada y el control preciso de la temperatura nos permiten conseguir ese punto exacto de cocción 
                que caracteriza a nuestros pollos asados.
              </p>

              {/* Métricas */}
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#D4AF37]">20+</div>
                  <div className="text-sm text-gray-400 mt-2">Años de Experiencia</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#D4AF37]">100%</div>
                  <div className="text-sm text-gray-400 mt-2">Leña Natural</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#D4AF37] flex justify-center items-center">5⭐</div>
                  <div className="text-sm text-gray-400 mt-2">Valoración</div>
                </div>
              </div>
            </div>

            <div className="relative w-full max-w-md">
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
      <section className="py-20 bg-[#2C2C2C] text-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-6xl mx-auto space-y-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-dancing text-center">Nuestras Especialidades</h2>
            <div className="grid md:grid-cols-3 gap-10">
              <div className="text-center space-y-6">
                <div className="overflow-hidden rounded-xl">
                  <img src="/img/aburrido.svg" alt="Menú 1" className="w-full h-64 object-cover transition-transform hover:scale-105 duration-300" />
                </div>
                <h3 className="text-2xl font-dancing text-[#D4AF37]">Menú 1</h3>
                <p className="text-gray-300">Medio pollo con una ración de patatas y 4 Croquetas</p>
                <p className="text-3xl font-bold text-[#D4AF37]">8€</p>
              </div>
              <div className="text-center space-y-6">
                <div className="overflow-hidden rounded-xl">
                  <img src="/img/aburrido.svg" alt="Menú 2" className="w-full h-64 object-cover transition-transform hover:scale-105 duration-300" />
                </div>
                <h3 className="text-2xl font-dancing text-[#D4AF37]">Menú 2</h3>
                <p className="text-gray-300">Un pollo con una ración de patatas y 4 Croquetas</p>
                <p className="text-3xl font-bold text-[#D4AF37]">12€</p>
              </div>
              <div className="text-center space-y-6">
                <div className="overflow-hidden rounded-xl">
                  <img src="/img/aburrido.svg" alt="Menú 3" className="w-full h-64 object-cover transition-transform hover:scale-105 duration-300" />
                </div>
                <h3 className="text-2xl font-dancing text-[#D4AF37]">Menú 3</h3>
                <p className="text-gray-300">Un pollo y medio con tres raciones de patatas y 6 Croquetas</p>
                <p className="text-3xl font-bold text-[#D4AF37]">20€</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Fusión Culinaria */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-6xl mx-auto space-y-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center space-y-6">
              <h2 className="text-5xl font-dancing text-[#8B4513]">Fusión Armenia-Española</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Descubre una experiencia gastronómica única donde la rica tradición 
                culinaria armenia se encuentra con los sabores mediterráneos españoles.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {[
                {
                  title: "Sabores Armenios",
                  description: "Descubre nuestras especialidades armenias, preparadas con recetas tradicionales transmitidas de generación en generación."
                },
                {
                  title: "Sabores Españoles",
                  description: "Disfruta de nuestros clásicos españoles con un toque especial, preparados con ingredientes frescos y de alta calidad."
                },
                {
                  title: "Fusión Armenia-Española",
                  description: "Descubre la sinergia perfecta entre ambos mundos culinarios. Experimenta una fusión de sabores que te sorprenderá."
                }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className="bg-white rounded-xl shadow-xl overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                >
                  <div className="overflow-hidden">
                    <img 
                      src="/img/aburrido.svg" 
                      alt={item.title}
                      className="w-full h-64 object-cover transition-transform hover:scale-105 duration-300"
                    />
                  </div>
                  <div className="p-8 space-y-4">
                    <h3 className="text-2xl font-dancing text-[#8B4513]">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Salón de Eventos */}
      <section className="py-20 bg-[#F9F5F0]">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="space-y-8">
              <h2 className="text-5xl font-dancing text-[#8B4513]">Salón para Eventos</h2>
              <p className="text-xl leading-relaxed text-gray-600">
                Celebra tus momentos especiales en nuestro amplio salón, perfecto 
                para reuniones familiares, eventos corporativos o celebraciones 
                especiales. Ofrecemos un espacio acogedor y un servicio 
                personalizado para hacer de tu evento algo inolvidable.
              </p>
              <ul className="space-y-6">
                <li className="flex items-center gap-4">
                  <Users className="h-6 w-6 text-[#8B4513]" />
                  <span className="text-lg">Capacidad para 100 personas</span>
                </li>
                <li className="flex items-center gap-4">
                  <Utensils className="h-6 w-6 text-[#8B4513]" />
                  <span className="text-lg">Menús personalizados</span>
                </li>
                <li className="flex items-center gap-4">
                  <Calendar className="h-6 w-6 text-[#8B4513]" />
                  <span className="text-lg">Disponibilidad flexible</span>
                </li>
              </ul>
              <Link href="/contact">
                <Button size="lg" className="mt-6 bg-[#8B4513] hover:bg-[#6F3710]">
                  Consultar Disponibilidad
                </Button>
              </Link>
            </div>
            <div className="relative">
              <img 
                src="/img/aburrido.svg" 
                alt="Nuestro salón de eventos"
                className="rounded-xl shadow-2xl w-full h-auto"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-6xl mx-auto space-y-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-dancing text-center text-[#8B4513]">Lo que dicen nuestros clientes</h2>
            <div className="grid md:grid-cols-3 gap-10">
              {[1, 2, 3].map((i) => (
                <motion.div 
                  key={i}
                  className="bg-white rounded-xl shadow-xl p-8 space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                >
                  <Star className="h-10 w-10 text-[#D4AF37] mx-auto" />
                  <p className="text-lg text-gray-600 italic">
                    "El mejor pollo asado que he probado. El sabor de la leña marca 
                    la diferencia. Volveremos seguro."
                  </p>
                  <div className="text-sm text-gray-500 text-center">
                    - Cliente Satisfecho
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Servicios Especiales */}
      <section className="py-20 bg-[#2C2C2C] text-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-6xl mx-auto space-y-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-dancing text-center">Servicios Especiales</h2>
            <div className="grid md:grid-cols-3 gap-10">
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
                <div key={index} className="p-8 border border-gray-700 rounded-xl hover:border-[#D4AF37] transition-colors duration-300">
                  <service.icon className="h-12 w-12 text-[#D4AF37] mx-auto mb-6" />
                  <h3 className="text-2xl font-dancing mb-4 text-center">{service.title}</h3>
                  <p className="text-gray-400 text-center">{service.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sobre Nosotros */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-3xl mx-auto text-center space-y-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-dancing text-[#8B4513]">Nuestra Historia</h2>
            <div className="prose prose-lg mx-auto text-gray-600">
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
      <section className="py-20 bg-[#F5F5F5]">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
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
                  <div key={hour.id} className="flex justify-between items-center">
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
                    <p>C/ Celada 72, Villena (03400) Alicante</p>
                    <p className="flex items-center justify-center gap-2 mt-2">
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
                className="text-center space-y-6"
              >
                <item.icon className="h-16 w-16 text-[#8B4513] mx-auto" />
                <h3 className="text-2xl font-dancing text-[#8B4513]">{item.title}</h3>
                <div className="text-lg text-gray-600">{item.content}</div>
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