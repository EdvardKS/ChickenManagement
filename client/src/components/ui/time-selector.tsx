import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";

interface TimeSelectorProps {
  value?: string;
  onChange: (time: string) => void;
  label?: string;
  disabled?: boolean;
}

const PRESET_TIMES = ["13:00", "13:30", "14:00", "14:30"];

// Function to get suggested default time based on current time
function getSuggestedTime(): string {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // If it's before 12:45, suggest 13:00
  if (currentHour < 12 || (currentHour === 12 && currentMinute < 45)) {
    return "13:00";
  }
  // If it's between 12:45 and 13:10, suggest 13:30
  else if (currentHour === 12 || (currentHour === 13 && currentMinute < 10)) {
    return "13:30";
  }
  // If it's between 13:10 and 13:40, suggest 14:00
  else if (currentHour === 13 && currentMinute < 40) {
    return "14:00";
  }
  // Otherwise suggest 14:30
  else {
    return "14:30";
  }
}

export function TimeSelector({ value, onChange, label = "Hora de recogida", disabled = false }: TimeSelectorProps) {
  const [selectedTime, setSelectedTime] = useState<string>("");

  // Initialize with suggested time on component mount
  useEffect(() => {
    if (!value) {
      const suggestedTime = getSuggestedTime();
      setSelectedTime(suggestedTime);
      onChange(suggestedTime);
    } else {
      setSelectedTime(value);
    }
  }, []);

  // Update internal state when external value changes
  useEffect(() => {
    if (value && value !== selectedTime) {
      setSelectedTime(value);
    }
  }, [value]);

  const handlePresetTimeClick = (time: string) => {
    setSelectedTime(time);
    onChange(time);
  };

  const handleManualTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const time = event.target.value;
    setSelectedTime(time);
    onChange(time);
  };

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        {label}
      </Label>
      
      {/* Preset time buttons */}
      <div className="grid grid-cols-2 gap-2">
        {PRESET_TIMES.map((time) => (
          <Button
            key={time}
            type="button"
            variant={selectedTime === time ? "default" : "outline"}
            onClick={() => handlePresetTimeClick(time)}
            disabled={disabled}
            className="h-10"
          >
            {time}
          </Button>
        ))}
      </div>

      {/* Manual time input */}
      <div className="flex items-center gap-2">
        <Label htmlFor="manual-time" className="text-sm text-muted-foreground whitespace-nowrap">
          Otra hora:
        </Label>
        <Input
          id="manual-time"
          type="time"
          value={selectedTime}
          onChange={handleManualTimeChange}
          disabled={disabled}
          className="flex-1"
        />
      </div>
    </div>
  );
}