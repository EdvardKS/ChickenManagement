import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const heroTexts = [
  {
    title: "Los mejores pollos a la leña de Villena",
    description: "Tradición, fuego y calidad para toda la comarca. El auténtico sabor del asado tradicional."
  },
  {
    title: "Expertos en eventos y celebraciones",
    description: "Servicio especial para escuadras, fiestas y reuniones. ¡Tu celebración perfecta en Villena!"
  },
  {
    title: "Croquetas caseras artesanales",
    description: "Sabores únicos: pollo, jabalí y queso. Elaboradas con ingredientes naturales de primera calidad."
  },
  {
    title: "Maestros en paellas gigantes",
    description: "Especialistas en paellas para más de 100 personas. Ideal para grandes eventos en la comarca."
  },
  {
    title: "20 años de experiencia en Villena",
    description: "La comarca confía en nuestro asador. El sabor único del auténtico pollo a la leña."
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
          <h1 className="mb-4">
            {heroTexts[currentIndex].title}
          </h1>
          <p className="mb-8">
            {heroTexts[currentIndex].description}
          </p>
          <div className="hero-banner-btns">
            <Link href="/order">
              <Button
                variant="default"
                size="lg"
                className="bg-[#8B4513] text-white border-none hover:bg-[#6d3610]"
              >
                Hacer Pedido
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="text-white border-white hover:bg-white hover:text-[#8B4513] ml-4"
              >
                Contactar
              </Button>
            </Link>
          </div>
        </div>
      </figcaption>
    </section>
  );
}