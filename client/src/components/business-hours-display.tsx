import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";
import type { BusinessHours } from "@shared/schema";

const DAYS_ORDERED = [
  'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
];

interface BusinessHoursDisplayProps {
  hours: BusinessHours[] | undefined;
  variant?: 'default' | 'compact';
}

export default function BusinessHoursDisplay({ hours, variant = 'default' }: BusinessHoursDisplayProps) {
  if (!hours) return null;

  // Ordenar los días comenzando por Lunes (1) hasta Domingo (0)
  const orderedHours = [...hours].sort((a, b) => {
    const dayA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
    const dayB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
    return dayA - dayB;
  });

  if (variant === 'compact') {
    return (
      <div className="space-y-2">
        {orderedHours.map((hour) => (
          <div key={hour.id} className="flex justify-between text-sm">
            <span className="font-medium">{DAYS_ORDERED[hour.dayOfWeek === 0 ? 6 : hour.dayOfWeek - 1]}</span>
            <span>{hour.isOpen ? `${hour.openTime} - ${hour.closeTime}` : 'Cerrado'}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
      {orderedHours.map((hour) => (
        <Card key={hour.id} className={`p-4 ${hour.isOpen ? 'bg-white' : 'bg-gray-50'}`}>
          <div className="text-center space-y-2">
            <h3 className="font-dancing text-xl text-[#8B4513]">
              {DAYS_ORDERED[hour.dayOfWeek === 0 ? 6 : hour.dayOfWeek - 1]}
            </h3>
            <div className={`flex items-center justify-center gap-2 ${hour.isOpen ? 'text-green-600' : 'text-red-500'}`}>
              <Clock className="h-4 w-4" />
              <span className="font-medium">
                {hour.isOpen ? `${hour.openTime} - ${hour.closeTime}` : 'Cerrado'}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
