import { useCallback, useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

interface ReviewData {
  id: number;
  name: string;
  initials: string;
  reviewCount: string;
  photoCount?: string;
  timeAgo: string;
  text: string;
  rating: number;
  serviceType?: string;
  foodType?: string;
  priceRange?: string;
  recommendedDishes?: string;
  restrictions?: string;
  ratings?: {
    food?: number;
    service?: number;
    atmosphere?: number;
  };
}

const reviews: ReviewData[] = [
  {
    id: 1,
    name: 'Cristina Perez Martinez',
    initials: 'CP',
    reviewCount: '9 reseñas',
    timeAgo: 'Hace 6 meses',
    text: 'Hemos pedido 3 días para comer en fiestas, siendo más de 35 personas por día. Han sido puntales, puso todos los días cosas para una persona celíaca, la comida: tanto el plato principal como el aperitivo estaba muy bueno!! Lo recomiendo 100%.',
    rating: 5,
    serviceType: 'Me lo trajeron',
    foodType: 'Comida',
    priceRange: '10-20 €',
    recommendedDishes: 'Rustidera de Cordero',
    restrictions: 'Tienen comida para celíacos.'
  },
  {
    id: 2,
    name: 'Paco Navarro',
    initials: 'PN',
    reviewCount: '29 reseñas',
    photoCount: '22 fotos',
    timeAgo: 'Hace 5 meses',
    text: 'Muy buena comida, nosotros compramos salicón de pulpo y estaba blandito y buenísimo también macarrones para mí niña y le encantó patatas al montón muy buenas y pimientos rellenos de arroz tres delicias muy buenos también seguro que repetiremos.',
    rating: 5,
    serviceType: 'Recogí el pedido',
    foodType: 'Comida',
    priceRange: '10-20 €',
    recommendedDishes: 'Paella Por Persona'
  },
  {
    id: 3,
    name: 'Miguel Angel Martinez',
    initials: 'MA',
    reviewCount: '280 reseñas',
    photoCount: '290 fotos',
    timeAgo: 'Hace 5 meses',
    text: 'Todo riquísimo, hacen toda clase de platos para llevar, incluidos los pollos muy famosos en el barrio donde está situado. Les avala una larga carrera, que en un negocio de hostelería siempre es de agradecer.',
    rating: 5,
    serviceType: 'Recogí el pedido',
    foodType: 'Cena',
    priceRange: '10-20 €',
    recommendedDishes: 'Paella Por Persona, Rustidera de Cordero y Huevos Rotos'
  },
  {
    id: 4,
    name: 'Paqui ABAD',
    initials: 'PA',
    reviewCount: '1 reseña',
    timeAgo: 'Hace 6 meses',
    text: 'Tanto la comida como el trato inmejorable. En fiestas nos llevaron las comidas y cenas al local y todo buenísimo desde unas pelotas, paella rustidera de pulpo etc...',
    rating: 5,
    ratings: {
      food: 5,
      service: 5,
      atmosphere: 5
    }
  },
  {
    id: 5,
    name: 'Beli Day',
    initials: 'BD',
    reviewCount: '29 reseñas',
    photoCount: '11 fotos',
    timeAgo: 'Hace un año',
    text: 'Fuimos a recoger el pollo con patatas que encargamos por teléfono. El sitio lo encontré por google... No se que amamos más... Si la comida o la atención. El pollo crujiente y jugoso, especiado de una manera RIQUISIMA, las patatas fritas estaban buenisimas! No sé como las hacen pero incluso las que nos sobraron al día siguiente seguían estando super ricas!. Volveremos por la comida pero también por el trato, la señora que nos atendió es un amor y nos han conquistado corazón y estómago!!!',
    rating: 5,
    serviceType: 'Recogí el pedido',
    foodType: 'Comida',
    priceRange: '1-10 €'
  }
];

export default function GoogleReviewsCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, dragFree: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    
    // Configurar el intervalo para cambiar automáticamente cada 5 segundos
    const autoplay = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 5000);
    
    return () => {
      emblaApi.off("select", onSelect);
      clearInterval(autoplay);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative overflow-hidden rounded-xl shadow-xl">
      {/* Google Reviews Header */}
      <div className="bg-white p-4 border-b flex items-center gap-3 z-10 relative">
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

      {/* Embla Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {reviews.map((review) => (
            <div key={review.id} className="flex-[0_0_100%] min-w-0 bg-white p-4" style={{ flex: '0 0 100%' }}>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-medium text-gray-600">
                    {review.initials}
                  </div>
                  <div>
                    <div className="font-medium">{review.name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <span>{review.reviewCount}</span>
                      {review.photoCount && (
                        <>
                          <span>•</span>
                          <span>{review.photoCount}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{review.timeAgo}</span>
                    </div>
                  </div>
                </div>
                <div className="flex">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-sm text-gray-700">
                  {review.text}
                </p>
                <div className="text-xs text-gray-500">
                  {review.serviceType && (
                    <div className="font-medium">Servicio: {review.serviceType}</div>
                  )}
                  {review.foodType && (
                    <div className="font-medium">Tipo de comida: {review.foodType}</div>
                  )}
                  {review.priceRange && (
                    <div className="font-medium">Precio por persona: {review.priceRange}</div>
                  )}
                  {review.recommendedDishes && (
                    <div className="mt-2">Platos recomendados: {review.recommendedDishes}</div>
                  )}
                  {review.restrictions && (
                    <div>{review.restrictions}</div>
                  )}
                  {review.ratings && (
                    <>
                      {review.ratings.food && <div className="font-medium">Comida: {review.ratings.food}/5</div>}
                      {review.ratings.service && <div className="font-medium">Servicio: {review.ratings.service}/5</div>}
                      {review.ratings.atmosphere && <div className="font-medium">Ambiente: {review.ratings.atmosphere}/5</div>}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Carousel Indicators */}
      <div className="flex justify-center gap-2 py-4 bg-white">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              index === selectedIndex ? 'bg-[#8B4513]' : 'bg-gray-300'
            }`}
            onClick={() => scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Google Attribution */}
      <div className="py-2 px-4 bg-gray-100 text-xs text-center text-gray-500">
        Basado en reseñas de Google
      </div>
    </div>
  );
}