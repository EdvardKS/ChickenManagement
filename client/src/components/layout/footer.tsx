import { Phone, Mail, MapPin } from "lucide-react";
import { SiFacebook, SiInstagram } from "react-icons/si";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Asador La Morenica</h3>
            <p className="text-gray-400">
              Los mejores pollos asados a la leña en Villena y comarca.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Contacto</h3>
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                965813907 / 686536975
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                asadorlamorenica@gmail.com
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                C/ Celada 72, Villena (03400) Alicante
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Síguenos</h3>
            <div className="flex gap-4">
              <a 
                href="https://es-es.facebook.com/people/Asador-la-morenica/100064982920008/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-gray-400 flex items-center gap-2"
              >
                <SiFacebook className="h-5 w-5" />
                Facebook
              </a>
              <a 
                href="https://www.instagram.com/asadolamorenica/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-gray-400 flex items-center gap-2"
              >
                <SiInstagram className="h-5 w-5" />
                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Asador La Morenica. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}