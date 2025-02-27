import { Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FloatingContact() {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-50">
      <a 
        href="https://wa.me/34654027015" 
        target="_blank" 
        rel="noopener noreferrer"
        className="transition-transform hover:scale-105"
      >
        <Button size="lg" className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600">
          <MessageCircle className="h-6 w-6" />
        </Button>
      </a>
      <a 
        href="tel:+34654027015"
        className="transition-transform hover:scale-105"
      >
        <Button size="lg" className="w-12 h-12 rounded-full bg-orange-600 hover:bg-orange-700">
          <Phone className="h-6 w-6" />
        </Button>
      </a>
    </div>
  );
}
