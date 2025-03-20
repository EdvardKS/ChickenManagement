import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock, Calendar, MessageCircle, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { BusinessHours } from "@shared/schema";
import BusinessHoursDisplay from "@/components/business-hours-display";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Contacto() {
  const { data: businessHours } = useQuery<BusinessHours[]>({ 
    queryKey: ['/api/business-hours'] 
  });

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Banner principal */}
      <motion.div
        className="w-full h-64 md:h-96 relative overflow-hidden rounded-xl shadow-xl mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <img 
          src="/img/corporativa/maxtor/Castillo-de-Villena1.jpg" 
          alt="Castillo de Villena - Contacta con Asador La Morenica" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
          <div className="p-8 text-white">
            <h1 className="text-4xl md:text-5xl font-dancing mb-3">Contacta con Nosotros</h1>
            <p className="text-lg md:text-xl">Estamos aquí para ayudarte</p>
          </div>
        </div>
      </motion.div>
      
      {/* Franja decorativa */}
      <div className="relative py-6 my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#D2B48C]"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4">
            <img src="/img/corporativa/svg/phone-icon.svg" alt="Contacto" className="w-12 h-12" />
          </span>
        </div>
      </div>
      
      <motion.div 
        className="text-center space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-dancing text-[#8B4513]">Contacto</h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          Estamos encantados de atenderte. No dudes en contactar con nosotros para cualquier consulta,
          reserva o información sobre nuestros servicios.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#8B4513]">
                <Phone className="h-5 w-5" />
                Teléfonos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-lg">965813907</p>
              <p className="text-lg">686536975</p>
              <p className="text-sm text-gray-500 mt-4">
                Llámanos para reservas, pedidos o cualquier consulta
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#8B4513]">
                <Mail className="h-5 w-5" />
                Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-lg">asadorlamorenica@gmail.com</p>
              <p className="text-sm text-gray-500 mt-4">
                Escríbenos para información, presupuestos o sugerencias
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#8B4513]">
                <MapPin className="h-5 w-5" />
                Dirección
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-lg">C/ Celada 72</p>
              <p className="text-lg">Villena (03400)</p>
              <p className="text-lg">Alicante</p>
              <p className="text-sm text-gray-500 mt-4">
                Estamos ubicados en el centro de Villena, fácil acceso y aparcamiento
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#8B4513]">
                <Clock className="h-5 w-5" />
                Horario
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BusinessHoursDisplay hours={businessHours} variant="compact" />
              <p className="text-sm text-gray-500 mt-4">
                Abierto todos los días excepto los indicados
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="md:col-span-1"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#8B4513]">
                <Calendar className="h-5 w-5" />
                Reservas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Recomendamos reservar con antelación, especialmente para:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Grupos grandes</li>
                <li>Celebraciones</li>
                <li>Eventos especiales</li>
                <li>Fines de semana</li>
              </ul>
              <a href="tel:+34686536975">
                <Button className="w-full mt-4 bg-[#8B4513] hover:bg-[#6F3710]">
                  Llamar para Reservar
                </Button>
              </a>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="md:col-span-1"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#8B4513]">
                <MessageCircle className="h-5 w-5" />
                Redes Sociales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Síguenos para estar al día de nuestras novedades:</p>
              <div className="flex flex-col space-y-4">
                <a href="https://www.facebook.com/people/Asador-la-morenica/100064982920008/" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                  <img src="/img/corporativa/svg/facebook.svg" alt="Facebook" className="h-6 w-6" />
                  <span>Facebook</span>
                </a>
                <a href="https://www.instagram.com/asadolamorenica/?hl=es" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="flex items-center gap-2 hover:text-pink-600 transition-colors">
                  <img src="/img/corporativa/svg/instagram.svg" alt="Instagram" className="h-6 w-6" />
                  <span>Instagram</span>
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="md:col-span-1"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#8B4513]">
                <FileText className="h-5 w-5" />
                Pedidos Especiales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Para pedidos especiales como:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Catering para eventos</li>
                <li>Fiestas de Moros y Cristianos</li>
                <li>Menús personalizados</li>
                <li>Eventos corporativos</li>
              </ul>
              <a href="https://wa.me/34686536975" target="_blank" rel="noopener noreferrer">
                <Button className="w-full mt-4 bg-[#8B4513] hover:bg-[#6F3710]">
                  Solicitar Presupuesto
                </Button>
              </a>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-[#8B4513]">Ubicación</CardTitle>
          </CardHeader>
          <CardContent>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3127.7795673193446!2d-0.8697281!3d38.641887499999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd63df787f80d8db%3A0xed55f40214e65573!2sAsador%20La%20Morenica!5e0!3m2!1sen!2ses!4v1624901234567!5m2!1sen!2ses"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div 
        className="bg-[#FBF7F4] p-8 rounded-xl text-center space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
      >
        <h2 className="text-2xl font-dancing text-[#8B4513]">¿Necesitas más información?</h2>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          Estamos a tu disposición para resolver cualquier duda o consulta. No dudes en contactarnos
          por teléfono o email, o visítanos en nuestro local.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a href="tel:+34965813907">
            <Button className="bg-[#8B4513] hover:bg-[#6F3710]">
              965813907
            </Button>
          </a>
          <a href="tel:+34686536975">
            <Button className="bg-[#8B4513] hover:bg-[#6F3710]">
              686536975
            </Button>
          </a>
        </div>
      </motion.div>
    </div>
  );
}