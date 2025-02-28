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

  const sectionBaseClasses = "w-full py-16 sm:py-20 lg:py-24";
  const containerBaseClasses = "container mx-auto px-4 sm:px-6 lg:px-8";
  const maxWidthBaseClasses = "max-w-7xl mx-auto";

  return (
    <div className="min-h-screen bg-white">
      <HeroBanner />

      {/* Horno de Leña Tradicional */}
      <section className={`${sectionBaseClasses} bg-[#1A0F0F] text-white`}>
        <div className={containerBaseClasses}>
          <div className={`${maxWidthBaseClasses} flex flex-col lg:flex-row items-center justify-between gap-12`}>
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-dancing">Tradición del Horno de Leña</h2>
              <p className="text-base sm:text-lg lg:text-xl leading-relaxed text-gray-300">
                Nuestro horno de leña, el corazón de nuestra cocina, imparte ese sabor inconfundible que solo la cocción tradicional puede lograr. 
                La madera cuidadosamente seleccionada y el control preciso de la temperatura nos permiten conseguir ese punto exacto de cocción 
                que caracteriza a nuestros pollos asados.
              </p>
              <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-xl mx-auto lg:mx-0">
                <div className="text-center p-2 sm:p-4">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#D4AF37]">20+</div>
                  <div className="text-xs sm:text-sm text-gray-400 mt-2">Años de Experiencia</div>
                </div>
                <div className="text-center p-2 sm:p-4">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#D4AF37]">100%</div>
                  <div className="text-xs sm:text-sm text-gray-400 mt-2">Leña Natural</div>
                </div>
                <div className="text-center p-2 sm:p-4">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#D4AF37]">5⭐</div>
                  <div className="text-xs sm:text-sm text-gray-400 mt-2">Valoración</div>
                </div>
              </div>
            </div>
            <div className="flex-1 max-w-xl w-full px-4 lg:px-0">
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
      <section className={`${sectionBaseClasses} bg-[#2C2C2C] text-white`}>
        <div className={containerBaseClasses}>
          <motion.div 
            className={`${maxWidthBaseClasses} space-y-12`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-dancing text-center">Nuestras Especialidades</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
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
                <div key={index} className="text-center space-y-6">
                  <div className="overflow-hidden rounded-xl aspect-video">
                    <img 
                      src="/img/aburrido.svg" 
                      alt={menu.title} 
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    />
                  </div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-dancing text-[#D4AF37]">{menu.title}</h3>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-300">{menu.description}</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#D4AF37]">{menu.price}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Fusión Culinaria */}
      <section className={sectionBaseClasses}>
        <div className={containerBaseClasses}>
          <motion.div 
            className={`${maxWidthBaseClasses} space-y-12`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center space-y-6 max-w-3xl mx-auto">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-dancing text-[#8B4513]">Fusión Armenia-Española</h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600">
                Descubre una experiencia gastronómica única donde la rica tradición 
                culinaria armenia se encuentra con los sabores mediterráneos españoles.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
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
                  <div className="overflow-hidden aspect-video">
                    <img 
                      src="/img/aburrido.svg" 
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    />
                  </div>
                  <div className="p-6 sm:p-8 space-y-4">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-dancing text-[#8B4513]">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Salón de Eventos */}
      <section className={`${sectionBaseClasses} bg-[#F9F5F0]`}>
        <div className={containerBaseClasses}>
          <motion.div 
            className={`${maxWidthBaseClasses} grid lg:grid-cols-2 gap-12 items-center`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="space-y-6 order-2 lg:order-1">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-dancing text-[#8B4513]">Salón para Eventos</h2>
              <p className="text-base sm:text-lg lg:text-xl leading-relaxed text-gray-600">
                Celebra tus momentos especiales en nuestro amplio salón, perfecto 
                para reuniones familiares, eventos corporativos o celebraciones 
                especiales. Ofrecemos un espacio acogedor y un servicio 
                personalizado para hacer de tu evento algo inolvidable.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-[#8B4513]" />
                  <span className="text-base sm:text-lg">Capacidad para 100 personas</span>
                </li>
                <li className="flex items-center gap-3">
                  <Utensils className="h-6 w-6 text-[#8B4513]" />
                  <span className="text-base sm:text-lg">Menús personalizados</span>
                </li>
                <li className="flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-[#8B4513]" />
                  <span className="text-base sm:text-lg">Disponibilidad flexible</span>
                </li>
              </ul>
              <Link href="/contact">
                <Button size="lg" className="mt-6 bg-[#8B4513] hover:bg-[#6F3710]">
                  Consultar Disponibilidad
                </Button>
              </Link>
            </div>
            <div className="relative order-1 lg:order-2">
              <img 
                src="/img/aburrido.svg" 
                alt="Nuestro salón de eventos"
                className="rounded-xl shadow-2xl w-full h-auto aspect-video object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonios */}
      <section className={sectionBaseClasses}>
        <div className={containerBaseClasses}>
          <motion.div 
            className={`${maxWidthBaseClasses} space-y-12`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-dancing text-center text-[#8B4513]">
              Lo que dicen nuestros clientes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              {[1, 2, 3].map((i) => (
                <motion.div 
                  key={i}
                  className="bg-white rounded-xl shadow-xl p-6 sm:p-8 space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                >
                  <Star className="h-8 w-8 sm:h-10 sm:w-10 text-[#D4AF37] mx-auto" />
                  <p className="text-base sm:text-lg text-gray-600 italic">
                    "El mejor pollo asado que he probado. El sabor de la leña marca 
                    la diferencia. Volveremos seguro."
                  </p>
                  <div className="text-sm sm:text-base text-gray-500 text-center">
                    - Cliente Satisfecho
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Servicios Especiales */}
      <section className={`${sectionBaseClasses} bg-[#2C2C2C] text-white`}>
        <div className={containerBaseClasses}>
          <motion.div 
            className={`${maxWidthBaseClasses} space-y-12`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-dancing text-center">Servicios Especiales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
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
                  className="p-6 sm:p-8 border border-gray-700 rounded-xl hover:border-[#D4AF37] transition-colors duration-300"
                >
                  <service.icon className="h-10 w-10 sm:h-12 sm:w-12 text-[#D4AF37] mx-auto mb-4 sm:mb-6" />
                  <h3 className="text-xl sm:text-2xl font-dancing mb-3 sm:mb-4 text-center">{service.title}</h3>
                  <p className="text-sm sm:text-base text-gray-400 text-center">{service.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sobre Nosotros */}
      <section className={sectionBaseClasses}>
        <div className={containerBaseClasses}>
          <motion.div 
            className={`${maxWidthBaseClasses} text-center space-y-8`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-dancing text-[#8B4513]">Nuestra Historia</h2>
            <div className="prose prose-lg mx-auto px-4">
              <p className="text-base sm:text-lg lg:text-xl text-gray-600">
                Llevamos más de 20 años en Villena y comarca, orgullosos de ser un referente 
                en la zona gracias a nuestro horno de leña para asar pollos, lo que les 
                confiere un sabor inigualable y una textura distinta.
              </p>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600">
                En Asador La Morenica encontrarás una fusión única de cocina española y armenia, 
                creando una experiencia gastronómica inolvidable.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Información */}
      <section className={`${sectionBaseClasses} bg-[#F5F5F0]`}>
        <div className={containerBaseClasses}>
          <div className={`${maxWidthBaseClasses} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12`}>
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
                  <div key={hour.id} className="flex justify-between items-center text-sm sm:text-base">
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
                    <p className="text-sm sm:text-base">C/ Celada 72, Villena (03400) Alicante</p>
                    <p className="flex items-center justify-center gap-2 mt-2 text-sm sm:text-base">
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
                className="text-center space-y-4 sm:space-y-6 p-6 sm:p-8 bg-white rounded-xl shadow-lg"
              >
                <item.icon className="h-12 w-12 sm:h-16 sm:w-16 text-[#8B4513] mx-auto" />
                <h3 className="text-xl sm:text-2xl font-dancing text-[#8B4513]">{item.title}</h3>
                <div className="text-base sm:text-lg text-gray-600">{item.content}</div>
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