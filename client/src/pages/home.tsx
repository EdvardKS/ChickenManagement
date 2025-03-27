import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Clock, ChefHat, MapPin, Phone, Users, Utensils, Calendar, Star, Check } from "lucide-react";
import { motion } from "framer-motion";
import type { BusinessHours, Product } from "@shared/schema";
import HeroBanner from "@/components/hero-banner/HeroBanner";
import BusinessHoursDisplay from "@/components/business-hours-display";

export default function Home() {
  const { data: businessHours } = useQuery<BusinessHours[]>({ 
    queryKey: ['/api/business-hours'] 
  });
  
  const { data: featuredMenusData = [], isLoading: isLoadingMenus } = useQuery<Product[]>({ 
    queryKey: ['/api/menus/featured'] 
  });
  
  // Asegurarnos de que featuredMenus sea siempre un array válido
  const featuredMenus = Array.isArray(featuredMenusData) 
    ? featuredMenusData.filter((menu): menu is Product => menu !== null && typeof menu === 'object')
    : [];

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
                src="/img/products/categoria_paella.jpg" 
                alt="Nuestra paella tradicional" 
                className="rounded-xl shadow-2xl w-full h-auto object-cover"
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
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-dancing text-center">Nuestros Menús</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
              {featuredMenus.map((menu, index) => (
                <div key={menu.id} className="text-center space-y-6">
                  <div className="overflow-hidden rounded-xl aspect-video">
                    <img 
                      src={menu.imageUrl ? `/img/products/${menu.imageUrl}` : "/img/products/image-not-found.svg"} 
                      alt={menu.name} 
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    />
                  </div>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-dancing text-[#D4AF37]">{menu.name}</h3>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-300">{menu.description || "Sin descripción"}</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#D4AF37]">{menu.price}€</p>
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
                      src={index === 0 ? '/img/products/hamegh-haykakan-tolma.png' : 
                           index === 1 ? '/img/products/cochinillo.jpg' : 
                           '/img/products/categoria_aperitivo.jpg'}
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
                src="/img/corporativa/maxtor/nosotros/la_fachada.jpg" 
                alt="Nuestro salón de eventos"
                className="rounded-xl shadow-2xl w-full h-auto aspect-video object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Reseñas de Google */}
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
            <div className="relative overflow-hidden rounded-xl shadow-xl">
              {/* Google Reviews Header */}
              <div className="bg-white p-4 border-b flex items-center gap-3">
                <img 
                  src="/img/google-logo.svg" 
                  alt="Google" 
                  className="h-6 w-auto"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png";
                    target.className = "h-6 w-auto";
                  }}
                />
                <div className="text-sm font-medium">Reseñas de Google</div>
                <div className="flex items-center ml-auto">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <span className="ml-1 text-sm font-medium">5.0</span>
                </div>
              </div>

              {/* Google Reviews Carousel */}
              <div className="google-reviews-carousel overflow-x-auto pb-8">
                <div className="flex snap-x snap-mandatory">
                  {/* Review 1 */}
                  <div className="min-w-full md:min-w-[50%] lg:min-w-[33.333%] snap-start p-4 bg-white">
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-medium text-gray-600">
                          CP
                        </div>
                        <div>
                          <div className="font-medium">Cristina Perez Martinez</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <span>9 reseñas</span>
                            <span>•</span>
                            <span>Hace 6 meses</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        ))}
                      </div>
                      <p className="text-sm text-gray-700">
                        Hemos pedido 3 días para comer en fiestas, siendo más de 35 personas por día. Han sido puntales, puso todos los días cosas para una persona celíaca, la comida: tanto el plato principal como el aperitivo estaba muy bueno!! Lo recomiendo 100%.
                      </p>
                      <div className="text-xs text-gray-500">
                        <div className="font-medium">Servicio: Me lo trajeron</div>
                        <div className="font-medium">Tipo de comida: Comida</div>
                        <div className="font-medium">Precio por persona: 10-20 €</div>
                        <div className="mt-2">Platos recomendados: Rustidera de Cordero</div>
                        <div>Restricciones alimentarias: Tienen comida para celíacos.</div>
                      </div>
                    </div>
                  </div>

                  {/* Review 2 */}
                  <div className="min-w-full md:min-w-[50%] lg:min-w-[33.333%] snap-start p-4 bg-white">
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-medium text-gray-600">
                          PN
                        </div>
                        <div>
                          <div className="font-medium">Paco Navarro</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <span>29 reseñas</span>
                            <span>•</span>
                            <span>22 fotos</span>
                            <span>•</span>
                            <span>Hace 5 meses</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        ))}
                      </div>
                      <p className="text-sm text-gray-700">
                        Muy buena comida, nosotros compramos salicón de pulpo y estaba blandito y buenísimo también macarrones para mí niña y le encantó patatas al montón muy buenas y pimientos rellenos de arroz tres delicias muy buenos también seguro que repetiremos.
                      </p>
                      <div className="text-xs text-gray-500">
                        <div className="font-medium">Servicio: Recogí el pedido</div>
                        <div className="font-medium">Tipo de comida: Comida</div>
                        <div className="font-medium">Precio por persona: 10-20 €</div>
                        <div className="mt-2">Platos recomendados: Paella Por Persona</div>
                      </div>
                    </div>
                  </div>

                  {/* Review 3 */}
                  <div className="min-w-full md:min-w-[50%] lg:min-w-[33.333%] snap-start p-4 bg-white">
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-medium text-gray-600">
                          MA
                        </div>
                        <div>
                          <div className="font-medium">Miguel Angel Martinez</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <span>280 reseñas</span>
                            <span>•</span>
                            <span>290 fotos</span>
                            <span>•</span>
                            <span>Hace 5 meses</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        ))}
                      </div>
                      <p className="text-sm text-gray-700">
                        Todo riquísimo, hacen toda clase de platos para llevar, incluidos los pollos muy famosos en el barrio donde está situado. Les avala una larga carrera, que en un negocio de hostelería siempre es de agradecer.
                      </p>
                      <div className="text-xs text-gray-500">
                        <div className="font-medium">Servicio: Recogí el pedido</div>
                        <div className="font-medium">Tipo de comida: Cena</div>
                        <div className="font-medium">Precio por persona: 10-20 €</div>
                        <div className="mt-2">Platos recomendados: Paella Por Persona, Rustidera de Cordero y Huevos Rotos</div>
                      </div>
                    </div>
                  </div>

                  {/* Review 4 */}
                  <div className="min-w-full md:min-w-[50%] lg:min-w-[33.333%] snap-start p-4 bg-white">
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-medium text-gray-600">
                          PA
                        </div>
                        <div>
                          <div className="font-medium">Paqui ABAD</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <span>1 reseña</span>
                            <span>•</span>
                            <span>Hace 6 meses</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        ))}
                      </div>
                      <p className="text-sm text-gray-700">
                        Tanto la comida como el trato inmejorable. En fiestas nos llevaron las comidas y cenas al local y todo buenísimo desde unas pelotas, paella rustidera de pulpo etc...
                      </p>
                      <div className="text-xs text-gray-500">
                        <div className="font-medium">Comida: 5/5</div>
                        <div className="font-medium">Servicio: 5/5</div>
                        <div className="font-medium">Ambiente: 5/5</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Review 5 */}
                  <div className="min-w-full md:min-w-[50%] lg:min-w-[33.333%] snap-start p-4 bg-white">
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-medium text-gray-600">
                          BD
                        </div>
                        <div>
                          <div className="font-medium">Beli Day</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <span>29 reseñas</span>
                            <span>•</span>
                            <span>11 fotos</span>
                            <span>•</span>
                            <span>Hace un año</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        ))}
                      </div>
                      <p className="text-sm text-gray-700">
                        Fuimos a recoger el pollo con patatas que encargamos por teléfono. El sitio lo encontré por google... No se que amamos más... Si la comida o la atención.
                        El pollo crujiente y jugoso, especiado de una manera RIQUISIMA, las patatas fritas estaban buenisimas! No sé como las hacen pero incluso las que nos sobraron al día siguiente seguían estando super ricas!. Volveremos por la comida pero también por el trato, la señora que nos atendió es un amor y nos han conquistado corazón y estómago!!!
                      </p>
                      <div className="text-xs text-gray-500">
                        <div className="font-medium">Servicio: Recogí el pedido</div>
                        <div className="font-medium">Tipo de comida: Comida</div>
                        <div className="font-medium">Precio por persona: 1-10 €</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Carousel Controls/Indicators */}
              <div className="flex justify-center gap-2 pb-6 bg-white">
                <div className="w-2.5 h-2.5 rounded-full bg-[#8B4513]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
              </div>
              
              {/* Google Attribution */}
              <div className="py-2 px-4 bg-gray-100 text-xs text-center text-gray-500">
                Basado en reseñas de Google
              </div>
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

      {/* Fiestas de Moros y Cristianos */}
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
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-dancing text-[#8B4513]">Villena Fiestas de Moros y Cristianos</h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600">
                Servimos con encargos especiales para las fiestas de Moros y Cristianos de Villena. Repartimos a escuadras especiales
                y ofrecemos menús personalizados para grupos y comparsas.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
              <motion.div 
                className="overflow-hidden rounded-xl shadow-xl"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <img 
                  src="/img/festeros/caballerosAlada.jpg" 
                  alt="Escuadra de Moros y Cristianos" 
                  className="w-full h-auto aspect-video object-cover"
                />
              </motion.div>
              
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-dancing text-[#8B4513]">Encargos para Festeros</h3>
                <p className="text-base sm:text-lg text-gray-600">
                  Durante las fiestas patronales, ofrecemos un servicio especial para comparsas y grupos de festeros. 
                  Prepara tu pedido con antelación y disfruta de nuestros deliciosos platos en tu escuadra.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <Check className="h-6 w-6 text-green-500" />
                    <span className="text-base sm:text-lg">Raciones para grupos grandes</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-6 w-6 text-green-500" />
                    <span className="text-base sm:text-lg">Reparto a escuadras y kábilas</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-6 w-6 text-green-500" />
                    <span className="text-base sm:text-lg">Menús especiales para fiestas</span>
                  </li>
                </ul>
                <Link href="/contact">
                  <Button size="lg" className="mt-2 bg-[#8B4513] hover:bg-[#6F3710]">
                    Consultar Disponibilidad
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sobre Nosotros */}
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
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-dancing text-[#8B4513]">Nuestra Historia</h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600">
                Llevamos más de 20 años en Villena y comarca, orgullosos de ser un referente 
                en la zona gracias a nuestro horno de leña para asar pollos, lo que les 
                confiere un sabor inigualable y una textura distinta.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
              <motion.div 
                className="overflow-hidden rounded-xl shadow-xl"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <img 
                  src="/img/corporativa/maxtor/nosotros/los_duenyos.jpg" 
                  alt="Los dueños del Asador La Morenica" 
                  className="w-full h-auto object-cover"
                />
              </motion.div>
              
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-dancing text-[#8B4513]">Tradición Familiar</h3>
                <p className="text-base sm:text-lg text-gray-600">
                  En Asador La Morenica encontrarás una fusión única de cocina española y armenia, 
                  creando una experiencia gastronómica inolvidable gracias a la pasión de una familia 
                  dedicada a ofrecer lo mejor de ambas culturas.
                </p>
                <p className="text-base sm:text-lg text-gray-600">
                  Nuestro equipo trabaja cada día para ofrecerte una atención personalizada y platos 
                  preparados con el máximo cuidado y los mejores ingredientes.
                </p>
              </motion.div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
              <motion.div 
                className="space-y-6 order-2 md:order-1"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-dancing text-[#8B4513]">Nuestro Asador</h3>
                <p className="text-base sm:text-lg text-gray-600">
                  El secreto de nuestro sabor único está en nuestro horno tradicional de leña, 
                  donde asamos los pollos siguiendo recetas transmitidas de generación en generación.
                </p>
                <p className="text-base sm:text-lg text-gray-600">
                  La combinación perfecta de tradiciones culinarias, el sabor de la leña y el 
                  cuidado en cada detalle hacen que cada visita a nuestro asador sea una 
                  experiencia para recordar.
                </p>
              </motion.div>
              
              <motion.div 
                className="overflow-hidden rounded-xl shadow-xl order-1 md:order-2"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <img 
                  src="/img/corporativa/maxtor/nosotros/nuestro_asador.jpg" 
                  alt="Nuestro asador tradicional" 
                  className="w-full h-auto object-cover"
                />
              </motion.div>
            </div>
            
            <motion.div 
              className="overflow-hidden rounded-xl shadow-xl mt-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <img 
                src="/img/corporativa/maxtor/nosotros/el_equipo.jpg" 
                alt="Nuestro equipo" 
                className="w-full h-auto object-cover"
              />
              <div className="p-6 text-center bg-white">
                <h3 className="text-xl sm:text-2xl font-dancing text-[#8B4513] mb-2">Nuestro Equipo</h3>
                <p className="text-gray-600">Un equipo dedicado a ofrecerte la mejor experiencia en cada visita</p>
              </div>
            </motion.div>
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
                content: <BusinessHoursDisplay hours={businessHours} variant="compact" />
              },
              {
                icon: MapPin,
                title: "Ubicación",
                content: (
                  <>
                    <p className="text-sm sm:text-base">C/ Celada 72, Villena (03400) Alicante</p>
                    <p className="flex items-center justify-center gap-2 mt-2 text-sm sm:text-base">
                      <Phone className="h-4 w-4" />
                      965813907 / 686536975
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