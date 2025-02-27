import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HeroBanner() {
  return (
    <section className="relative w-screen h-screen overflow-hidden">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        poster="https://asadorlamorenica.com/img/miniatura.jpg"
      >
        <source
          src="https://asadorlamorenica.com/img/corporativa/sliders/pollos_slider_home.mov"
          type="video/mp4"
        />
      </video>
      <div className="absolute inset-0 bg-black opacity-40"></div>
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full text-center px-4">
        <h1 className="text-white text-5xl md:text-7xl font-bold font-dancing mb-4">
          Los mejores pollos a la brasa
        </h1>
        <p className="text-white text-xl md:text-2xl mb-8">
          Tradición y sabor inigualable en cada bocado
        </p>
        <Link href="/order">
          <Button
            variant="outline"
            size="lg"
            className="bg-[#8B4513] text-white border-none"
          >
            Hacer Pedido
          </Button>
        </Link>
      </div>
    </section>
  );
}
