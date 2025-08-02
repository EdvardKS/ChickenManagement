import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock } from "lucide-react";

interface TimeSelectorProps {
  value?: string;
  onChange: (time: string) => void;
  label?: string;
  disabled?: boolean;
}

const PRESET_TIMES = ["13:00", "13:30", "14:00", "14:30"];

export function TimeSelector({ 
  value, 
  onChange, 
  label = "Hora de recogida",
  disabled = false 
}: TimeSelectorProps) {
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isManualSelection, setIsManualSelection] = useState<boolean>(false);

  // Generate all possible times (13:00 to 17:00 in 30-minute intervals)
  const allTimes = [];
  for (let hour = 13; hour <= 17; hour++) {
    allTimes.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 17) { // Don't add 17:30
      allTimes.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }

  // Function to get default time based on current time
  const getDefaultTime = (): string => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Si son antes de las 13:30, por defecto 13:30
    if (currentHour < 13 || (currentHour === 13 && currentMinute < 30)) {
      return "13:30";
    }
    
    // Si son las 13:15, por defecto 14:00
    if (currentHour === 13 && currentMinute >= 15 && currentMinute < 30) {
      return "14:00";
    }
    
    // Si son las 13:45, por defecto 14:30
    if (currentHour === 13 && currentMinute >= 45) {
      return "14:30";
    }
    
    // Si son las 14:15, por defecto 15:00
    if (currentHour === 14 && currentMinute >= 15 && currentMinute < 45) {
      return "15:00";
    }
    
    // Si son las 14:45, por defecto 15:30
    if (currentHour === 14 && currentMinute >= 45) {
      return "15:30";
    }
    
    // Si son las 15:15, por defecto 16:00
    if (currentHour === 15 && currentMinute >= 15 && currentMinute < 45) {
      return "16:00";
    }
    
    // Si son las 15:45, por defecto 16:30
    if (currentHour === 15 && currentMinute >= 45) {
      return "16:30";
    }
    
    // Si son las 16:15, por defecto 17:00
    if (currentHour === 16 && currentMinute >= 15) {
      return "17:00";
    }
    
    // Si son después de las 17:00, dejarlo sin seleccionar por defecto
    if (currentHour >= 17) {
      return "";
    }
    
    // Default to 13:30 for any other time
    return "13:30";
  };

  // Initialize with default value
  useEffect(() => {
    if (value !== undefined) {
      setSelectedTime(value);
      // Check if the value is one of the preset buttons
      setIsManualSelection(!PRESET_TIMES.includes(value));
    } else {
      // Default time based on current time
      const defaultTime = getDefaultTime();
      setSelectedTime(defaultTime);
      setIsManualSelection(!PRESET_TIMES.includes(defaultTime));
      onChange(defaultTime);
    }
  }, []);

  // Update internal state when external value changes
  useEffect(() => {
    if (value !== undefined && value !== selectedTime) {
      setSelectedTime(value);
      setIsManualSelection(!PRESET_TIMES.includes(value));
    }
  }, [value]);

  const handlePresetTimeClick = (time: string) => {
    setSelectedTime(time);
    setIsManualSelection(false);
    onChange(time);
  };

  const handleSelectorChange = (timeStr: string) => {
    setSelectedTime(timeStr);
    setIsManualSelection(!PRESET_TIMES.includes(timeStr));
    onChange(timeStr);
  };

  return (
    <div className="space-y-2">
      {/* Preset Time Buttons */}
      <div className="grid grid-cols-2 gap-1">
        {PRESET_TIMES.map((time) => {
          const isSelected = selectedTime === time && !isManualSelection;
          return (
            <Button
              key={time}
              type="button"
              variant={isSelected ? "default" : "outline"}
              onClick={() => handlePresetTimeClick(time)}
              disabled={disabled}
              size="sm"
              className={`h-8 text-xs transition-all duration-200 ${
                isSelected 
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md" 
                  : "border border-blue-200 hover:border-blue-400 hover:bg-blue-50"
              }`}
            >
              <Clock className="mr-1 h-3 w-3" />
              {time}
            </Button>
          );
        })}
      </div>

      {/* Time Selector */}
      <Select
        value={selectedTime}
        onValueChange={handleSelectorChange}
        disabled={disabled}
      >
        <SelectTrigger className="h-8 text-sm border border-gray-200 focus:border-blue-400">
          <SelectValue placeholder="Otras horas" />
        </SelectTrigger>
        <SelectContent>
          {allTimes.map((time) => (
            <SelectItem key={time} value={time} className="text-sm">
              {time}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}