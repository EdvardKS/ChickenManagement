import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { BusinessHours } from "@shared/schema";
import BusinessHoursDisplay from "@/components/business-hours-display";

export default function Contact() {
  const { data: businessHours } = useQuery<BusinessHours[]>({ 
    queryKey: ['/api/business-hours'] 
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold text-center">Contacto</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Teléfonos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>965813907</p>
            <p>654027015</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>asadorlamorenica@gmail.com</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Dirección
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>C/ Celada 72</p>
            <p>Villena (03400)</p>
            <p>Alicante</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BusinessHoursDisplay hours={businessHours} variant="compact" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ubicación</CardTitle>
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
    </div>
  );
}