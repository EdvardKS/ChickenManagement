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
    <>
      <HeroBanner />
        <div className="container mx-auto">

        {/* Horno de Leña Tradicional */}
        <section className="w-full bg-[#1A0F0F] text-white p-24 flex justify-center items-center">
        <div className="max-w-7xl w-full flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-12 text-center">

            {/* Contenido de la izquierda */}
            <div className="max-w-xl text-center">
              <h2 className="text-5xl font-dancing mb-6">Tradición del Horno de Leña</h2>
              <p className="text-xl leading-relaxed text-gray-300">
                Nuestro horno de leña, el corazón de nuestra cocina, imparte ese sabor inconfundible que solo la cocción tradicional puede lograr. 
                La madera cuidadosamente seleccionada y el control preciso de la temperatura nos permiten conseguir ese punto exacto de cocción 
                que caracteriza a nuestros pollos asados.
              </p>

              {/* Métricas */}
              <div className="grid grid-cols-3 gap-4 mt-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-[#D4AF37]">20+</div>
                  <div className="text-sm text-gray-400">Años de Experiencia</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-[#D4AF37]">100%</div>
                  <div className="text-sm text-gray-400">Leña Natural</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-[#D4AF37] flex justify-center items-center">
                    5⭐
                  </div>
                  <div className="text-sm text-gray-400">Valoración</div>
                </div>
              </div>
            </div>

            {/* Imagen centrada */}
            <div className="relative flex justify-center">
              <img 
                src="/public/img/aburrido.svg" 
                alt="Nuestro horno de leña tradicional" 
                className="rounded-lg shadow-2xl max-w-sm mx-auto"
              /> 
            </div>

          </div>
        </section>

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
                  <img src="/public/img/aburrido.svg" alt="Menú 1" className="rounded-lg shadow-xl mb-4" />
                  <h3 className="text-2xl font-dancing text-[#D4AF37]">Menú 1</h3>
                  <p>Medio pollo con una ración de patatas y 4 Croquetas</p>
                  <p className="text-2xl font-bold text-[#D4AF37]">8€</p>
                </div>
                <div className="text-center space-y-4">
                  <img src="/public/img/aburrido.svg" alt="Menú 2" className="rounded-lg shadow-xl mb-4" />
                  <h3 className="text-2xl font-dancing text-[#D4AF37]">Menú 2</h3>
                  <p>Un pollo con una ración de patatas y 4 Croquetas</p>
                  <p className="text-2xl font-bold text-[#D4AF37]">12€</p>
                </div>
                <div className="text-center space-y-4">
                  <img src="/public/img/aburrido.svg" alt="Menú 3" className="rounded-lg shadow-xl mb-4" />
                  <h3 className="text-2xl font-dancing text-[#D4AF37]">Menú 3</h3>
                  <p>Un pollo y medio con tres raciones de patatas y 6 Croquetas</p>
                  <p className="text-2xl font-bold text-[#D4AF37]">20€</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
  
        {/* Fusión Culinaria */}
        <section className="py-24">
          <div className="container">
            <motion.div 
              className="text-center max-w-4xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-5xl font-dancing mb-6">Fusión Armenia-Española</h2>
              <p className="text-xl text-gray-600">
                Descubre una experiencia gastronómica única donde la rica tradición 
                culinaria armenia se encuentra con los sabores mediterráneos españoles.
              </p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div 
                className="bg-white rounded-lg shadow-xl p-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <img 
                  src="/public/img/aburrido.svg" 
                  alt="Platos Armenios"
                  className="rounded-lg mb-6 w-full h-48 object-cover"
                />
                <h3 className="text-2xl font-dancing mb-4">Sabores Armenios</h3>
                <p className="text-gray-600">
                  Descubre nuestras especialidades armenias, preparadas con recetas 
                  tradicionales transmitidas de generación en generación.
                </p>
              </motion.div>
              <motion.div 
                className="bg-white rounded-lg shadow-xl p-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <img 
                  src="/public/img/aburrido.svg" 
                  alt="Platos Españoles"
                  className="rounded-lg mb-6 w-full h-48 object-cover"
                />
                <h3 className="text-2xl font-dancing mb-4">Sabores Españoles</h3>
                <p className="text-gray-600">
                  Disfruta de nuestros clásicos españoles con un toque especial, 
                  preparados con ingredientes frescos y de alta calidad.
                </p>
              </motion.div>
              <motion.div 
                className="bg-white rounded-lg shadow-xl p-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                <img 
                  src="/public/img/aburrido.svg" 
                  alt="Platos de Fusión"
                  className="rounded-lg mb-6 w-full h-48 object-cover"
                />
                <h3 className="text-2xl font-dancing mb-4">Fusión Armenia-Española</h3>
                <p className="text-gray-600">
                  Descubre la sinergia perfecta entre ambos mundos culinarios. 
                  Experimenta una fusión de sabores que te sorprenderá.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
  
        {/* Salón de Eventos */}
        <section className="py-24 bg-[#F9F5F0]">
          <div className="container">
            <motion.div 
              className="grid md:grid-cols-2 gap-12 items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="space-y-6">
                <h2 className="text-5xl font-dancing mb-6">Salón para Eventos</h2>
                <p className="text-xl leading-relaxed text-gray-600">
                  Celebra tus momentos especiales en nuestro amplio salón, perfecto 
                  para reuniones familiares, eventos corporativos o celebraciones 
                  especiales. Ofrecemos un espacio acogedor y un servicio 
                  personalizado para hacer de tu evento algo inolvidable.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-[#8B4513]" />
                    <span>Capacidad para 100 personas</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Utensils className="h-6 w-6 text-[#8B4513]" />
                    <span>Menús personalizados</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Calendar className="h-6 w-6 text-[#8B4513]" />
                    <span>Disponibilidad flexible</span>
                  </li>
                </ul>
                <Link href="/contact">
                  <Button size="lg" className="mt-6">Consultar Disponibilidad</Button>
                </Link>
              </div>
              <div className="relative">
                <img 
                  src="/public/img/aburrido.svg" 
                  alt="Nuestro salón de eventos"
                  className="rounded-lg shadow-2xl"
                />
              </div>
            </motion.div>
          </div>
        </section>
  
        {/* Testimonios */}
        <section className="py-24">
          <div className="container">
            <motion.div 
              className="text-center max-w-4xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-5xl font-dancing mb-6">Lo que dicen nuestros clientes</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <motion.div 
                    key={i}
                    className="bg-white rounded-lg shadow-xl p-8"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                  >
                    <Star className="h-8 w-8 text-[#D4AF37] mx-auto mb-4" />
                    <p className="text-gray-600 italic mb-4">
                      "El mejor pollo asado que he probado. El sabor de la leña marca 
                      la diferencia. Volveremos seguro."
                    </p>
                    <div className="text-sm text-gray-500">
                      - Cliente Satisfecho
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
  
        {/* Servicios Especiales */}
        <section className="py-24 bg-[#2C2C2C] text-white">
          <div className="container">
            <motion.div 
              className="text-center max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-5xl font-dancing mb-12">Servicios Especiales</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="p-6 border border-gray-700 rounded-lg">
                  <Utensils className="h-12 w-12 text-[#D4AF37] mx-auto mb-4" />
                  <h3 className="text-2xl font-dancing mb-4">Catering</h3>
                  <p className="text-gray-400">
                    Llevamos nuestros deliciosos platos a tu evento, manteniendo 
                    la misma calidad y sabor.
                  </p>
                </div>
                <div className="p-6 border border-gray-700 rounded-lg">
                  <Users className="h-12 w-12 text-[#D4AF37] mx-auto mb-4" />
                  <h3 className="text-2xl font-dancing mb-4">Eventos Privados</h3>
                  <p className="text-gray-400">
                    Organizamos tu celebración con un servicio personalizado y 
                    menús a medida.
                  </p>
                </div>
                <div className="p-6 border border-gray-700 rounded-lg">
                  <Calendar className="h-12 w-12 text-[#D4AF37] mx-auto mb-4" />
                  <h3 className="text-2xl font-dancing mb-4">Reservas Especiales</h3>
                  <p className="text-gray-400">
                    Reserva nuestro espacio para tus ocasiones especiales con 
                    atención exclusiva.
                  </p>
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
    </>
  );
}

function getDayName(day: number): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[day];
}