import { motion } from "framer-motion";

export default function Nosotros() {
  return (
    <div className="max-w-5xl mx-auto space-y-16">
      {/* Banner principal */}
      <motion.div
        className="w-full h-64 md:h-96 relative overflow-hidden rounded-xl shadow-xl mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <img 
          src="/img/local/fachada-banner.jpg" 
          alt="Asador La Morenica" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
          <div className="p-8 text-white">
            <h1 className="text-4xl md:text-5xl font-dancing mb-3">Asador La Morenica</h1>
            <p className="text-lg md:text-xl">Tradición y sabor desde 2002</p>
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
            <img src="/img/corporativa/svg/chicken-icon.svg" alt="Decoración" className="w-12 h-12" />
          </span>
        </div>
      </div>
      
      {/* Sección de Encabezado */}
      <motion.div 
        className="text-center space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-dancing text-[#8B4513]">Sobre Nosotros</h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          Descubre la historia y tradición detrás de Asador La Morenica, un lugar donde la pasión por la gastronomía
          y el respeto por nuestras raíces se unen para ofrecerte una experiencia única.
        </p>
      </motion.div>

      {/* Sección de Historia */}
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6"
        >
          <h2 className="text-3xl font-dancing text-[#8B4513]">Nuestra Historia</h2>
          <p className="text-gray-700">
            Fundado hace más de dos décadas, Asador La Morenica nació como un pequeño negocio familiar 
            con una visión clara: ofrecer auténticos pollos asados a la leña con el incomparable sabor 
            tradicional. Lo que comenzó como un modesto asador se ha convertido hoy en un referente 
            gastronómico en Villena.
          </p>
          <p className="text-gray-700">
            El nombre "La Morenica" rinde homenaje a la patrona de Villena, 
            manteniendo viva nuestra conexión con las tradiciones locales.
          </p>
          <p className="text-gray-700">
            A lo largo de los años, hemos perfeccionado nuestras recetas y ampliado nuestra carta, 
            pero siempre manteniendo la esencia que nos caracteriza: el sabor auténtico del 
            asado tradicional a la leña.
          </p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-lg overflow-hidden shadow-lg"
        >
          <img 
            src="/img/local/fachada.jpg" 
            alt="Fachada Asador La Morenica" 
            className="w-full h-auto object-cover"
          />
        </motion.div>
      </div>

      {/* Sección de Tradición y Sabor */}
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-lg overflow-hidden shadow-lg order-2 md:order-1"
        >
          <img 
            src="/img/especialidades/horno.jpg" 
            alt="Horno tradicional de leña" 
            className="w-full h-auto object-cover"
          />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-6 order-1 md:order-2"
        >
          <h2 className="text-3xl font-dancing text-[#8B4513]">Tradición y Sabor</h2>
          <p className="text-gray-700">
            En Asador La Morenica, mantenemos viva la tradición del asado a la leña, 
            un método que realza los sabores naturales de nuestros productos y les aporta 
            ese toque ahumado tan característico.
          </p>
          <p className="text-gray-700">
            Nuestro horno de leña, construido según técnicas tradicionales, es el corazón 
            de nuestro asador. En él, preparamos diariamente nuestros pollos y otras 
            especialidades, logrando una textura jugosa en el interior y una piel crujiente 
            y dorada en el exterior.
          </p>
          <p className="text-gray-700">
            Seleccionamos cuidadosamente cada ingrediente, priorizando la calidad y la 
            frescura, y combinamos las mejores técnicas de la cocina tradicional española 
            con toques de la gastronomía armenia.
          </p>
        </motion.div>
      </div>

      {/* Sección de Fusión Gastronómica */}
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="space-y-6"
        >
          <h2 className="text-3xl font-dancing text-[#8B4513]">Fusión Española y Armenia</h2>
          <p className="text-gray-700">
            Una de las características que hace único a Asador La Morenica es nuestra fusión 
            de sabores españoles y armenios, resultado de nuestros orígenes familiares.
          </p>
          <p className="text-gray-700">
            Esta combinación cultural se refleja en nuestras recetas, donde las técnicas de 
            asado mediterráneas se enriquecen con especias y métodos tradicionales armenios, 
            creando platos con personalidad propia.
          </p>
          <p className="text-gray-700">
            Nuestras "gabardinas", una especialidad de la casa, son un ejemplo perfecto de 
            esta fusión: pechuga de pollo marinada con especias armenias, empanada y frita 
            según la tradición española.
          </p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="rounded-lg overflow-hidden shadow-lg"
        >
          <img 
            src="/img/especialidades/fusion.jpg" 
            alt="Platos de fusión española y armenia" 
            className="w-full h-auto object-cover"
          />
        </motion.div>
      </div>

      {/* Sección de Compromiso */}
      <motion.div 
        className="bg-[#FBF7F4] p-8 rounded-xl shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-dancing text-[#8B4513]">Nuestro Compromiso</h2>
          <p className="text-gray-700">
            En Asador La Morenica, nos comprometemos a ofrecerte una experiencia gastronómica 
            auténtica, donde cada plato refleja nuestra pasión por la buena comida y el respeto 
            por las tradiciones culinarias.
          </p>
          <p className="text-gray-700">
            Trabajamos cada día para mantener la calidad que nos ha caracterizado durante más 
            de 20 años, adaptándonos a los nuevos tiempos pero sin perder nuestra esencia.
          </p>
          <p className="text-gray-700">
            Te invitamos a formar parte de nuestra historia y a descubrir por qué somos 
            el asador de referencia en Villena.
          </p>
        </div>
      </motion.div>

      {/* Sección de Salón para Eventos */}
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="rounded-lg overflow-hidden shadow-lg order-2 md:order-1"
        >
          <img 
            src="/img/salon/salon.jpg" 
            alt="Salón para eventos" 
            className="w-full h-auto object-cover"
          />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="space-y-6 order-1 md:order-2"
        >
          <h2 className="text-3xl font-dancing text-[#8B4513]">Salón para Eventos</h2>
          <p className="text-gray-700">
            Disponemos de un amplio salón para eventos, perfecto para celebraciones familiares, 
            reuniones de empresa, comidas de grupo y cualquier ocasión especial.
          </p>
          <p className="text-gray-700">
            Nuestro espacio puede acomodar hasta 60 personas y ofrece un ambiente acogedor 
            y elegante, ideal para disfrutar de nuestras especialidades en compañía.
          </p>
          <p className="text-gray-700">
            Ofrecemos menús personalizados adaptados a tus necesidades y presupuesto, 
            con la misma calidad y sabor que nos caracteriza.
          </p>
          <p className="text-gray-700">
            Consúltanos sobre disponibilidad y opciones para tu evento.
          </p>
        </motion.div>
      </div>

      {/* Sección para Moros y Cristianos */}
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="space-y-6"
        >
          <h2 className="text-3xl font-dancing text-[#8B4513]">Fiestas de Moros y Cristianos</h2>
          <p className="text-gray-700">
            En Asador La Morenica, nos enorgullece formar parte activa de las tradiciones 
            de Villena, especialmente durante las emblemáticas Fiestas de Moros y Cristianos.
          </p>
          <p className="text-gray-700">
            Ofrecemos servicios especiales para comparsas y cuartelillos, adaptándonos a las 
            necesidades específicas de cada comparsa durante estos días tan especiales.
          </p>
          <p className="text-gray-700">
            Nuestro menú festero, diseñado específicamente para estos días, incluye platos 
            tradicionales que complementan perfectamente la celebración.
          </p>
          <p className="text-gray-700">
            Recomendamos realizar reservas con antelación para las fechas de fiestas, dada la alta demanda.
          </p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="rounded-lg overflow-hidden shadow-lg"
        >
          <img 
            src="/img/especialidades/festeros.jpg" 
            alt="Fiestas de Moros y Cristianos" 
            className="w-full h-auto object-cover"
          />
        </motion.div>
      </div>

      {/* Llamada a la acción */}
      <motion.div 
        className="text-center space-y-6 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
      >
        <h2 className="text-3xl font-dancing text-[#8B4513]">Ven a Conocernos</h2>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          Te esperamos en C/ Celada 72, Villena, para ofrecerte una experiencia gastronómica 
          que combina tradición, sabor y hospitalidad.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <a 
            href="/order" 
            className="bg-[#8B4513] hover:bg-[#6d3610] text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Hacer un Pedido
          </a>
          <a 
            href="/contacto" 
            className="bg-white border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#FBF7F4] font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Contactar
          </a>
        </div>
      </motion.div>
    </div>
  );
}