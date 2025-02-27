import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const heroTexts = [
  {
    title: "Los mejores pollos a la leña de Villena",
    description: "Tradición, fuego y calidad para toda la comarca. El auténtico sabor del asado tradicional.",
    cta: {
      primary: {
        text: "Hacer Pedido",
        href: "/order",
        variant: "default",
        className: "bg-[#8B4513] text-white border-none hover:bg-[#6d3610]"
      }
    }
  },
  {
    title: "Expertos en eventos y celebraciones",
    description: "Servicio especial para escuadras, fiestas y reuniones. ¡Tu celebración perfecta en Villena!",
    cta: {
      primary: {
        text: "Contactar",
        href: "/contact",
        variant: "outline",
        className: "bg-white/10 text-white border-white hover:bg-white hover:text-[#8B4513]"
      }
    }
  },
  {
    title: "Croquetas caseras artesanales",
    description: "Sabores únicos: pollo, jabalí y queso. Elaboradas con ingredientes naturales de primera calidad.",
    cta: {
      primary: {
        text: "Ver Productos",
        href: "/products",
        variant: "default",
        className: "bg-[#8B4513] text-white border-none hover:bg-[#6d3610]"
      }
    }
  },
  {
    title: "Maestros en paellas gigantes",
    description: "Especialistas en paellas para más de 100 personas. Ideal para grandes eventos en la comarca.",
    cta: {
      primary: {
        text: "Seguir en Instagram",
        href: "https://www.instagram.com/asadolamorenica/",
        variant: "outline",
        className: "bg-white/10 text-white border-white hover:bg-white hover:text-[#8B4513]"
      }
    }
  },
  {
    title: "20 años de experiencia en Villena",
    description: "La comarca confía en nuestro asador. El sabor único del auténtico pollo a la leña.",
    cta: {
      primary: {
        text: "Nuestra Historia",
        href: "/about",
        variant: "default",
        className: "bg-[#8B4513] text-white border-none hover:bg-[#6d3610]"
      }
    }
  }
];

export default function HeroBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((current) => (current + 1) % heroTexts.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="hero-banner">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        poster="/img/miniatura.jpg"
      >
        <source
          src="/img/corporativa/sliders/pollos_slider_home.mov"
          type="video/mp4"
        />
      </video>
      <figcaption>
        <div className="hero-banner-body">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="flex flex-col items-center"
            >
              <h1 className="mb-4 text-4xl md:text-6xl lg:text-7xl">
                {heroTexts[currentIndex].title}
              </h1>
              <p className="mb-8 text-lg md:text-xl lg:text-2xl max-w-2xl text-center">
                {heroTexts[currentIndex].description}
              </p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link href={heroTexts[currentIndex].cta.primary.href}>
                  <Button
                    variant={heroTexts[currentIndex].cta.primary.variant as "default" | "outline"}
                    size="lg"
                    className={`w-full sm:w-auto ${heroTexts[currentIndex].cta.primary.className}`}
                  >
                    {heroTexts[currentIndex].cta.primary.text}
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </figcaption>
    </section>
  );
}