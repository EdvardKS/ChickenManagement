import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChefHat } from "lucide-react";

interface QuantitySelectorProps {
  value?: number;
  onChange: (quantity: number) => void;
  label?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

const PRESET_QUANTITIES = [0.5, 1, 1.5, 2];

export function QuantitySelector({ 
  value, 
  onChange, 
  label = "Cantidad de pollos", 
  disabled = false,
  min = 0.5,
  max = 50,
  step = 0.5
}: QuantitySelectorProps) {
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [isManualSelection, setIsManualSelection] = useState<boolean>(false);

  // Generate all possible quantities for the selector (0.5 to 10 in 0.5 increments)
  const allQuantities = Array.from({ length: 20 }, (_, i) => (i + 1) * 0.5);

  // Initialize with default value
  useEffect(() => {
    if (value !== undefined) {
      setSelectedQuantity(value);
      // Check if the value is one of the preset buttons
      setIsManualSelection(!PRESET_QUANTITIES.includes(value));
    } else {
      // Default to 1 pollo
      setSelectedQuantity(1);
      setIsManualSelection(false);
      onChange(1);
    }
  }, []);

  // Update internal state when external value changes
  useEffect(() => {
    if (value !== undefined && value !== selectedQuantity) {
      setSelectedQuantity(value);
      setIsManualSelection(!PRESET_QUANTITIES.includes(value));
    }
  }, [value]);

  const handlePresetQuantityClick = (quantity: number) => {
    setSelectedQuantity(quantity);
    setIsManualSelection(false);
    onChange(quantity);
  };

  const handleSelectorChange = (quantityStr: string) => {
    const quantity = parseFloat(quantityStr);
    setSelectedQuantity(quantity);
    setIsManualSelection(!PRESET_QUANTITIES.includes(quantity));
    onChange(quantity);
  };

  const handleManualQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const quantity = parseFloat(inputValue);
    
    // Validate the quantity
    if (!isNaN(quantity) && quantity >= min && quantity <= max) {
      // Round to nearest step (0.5)
      const roundedQuantity = Math.round(quantity / step) * step;
      setSelectedQuantity(roundedQuantity);
      onChange(roundedQuantity);
    } else if (inputValue === "") {
      // Allow empty input for better UX while typing
      setSelectedQuantity(0);
    }
  };

  const formatQuantityText = (qty: number): string => {
    if (qty === 0.5) return "Medio pollo";
    if (qty === 1) return "1 pollo";
    return `${qty} pollos`;
  };

  return (
    <div className="space-y-2">
      {/* Preset Quantity Buttons */}
      <div className="grid grid-cols-2 gap-1">
        {PRESET_QUANTITIES.map((quantity) => {
          const isSelected = selectedQuantity === quantity && !isManualSelection;
          return (
            <Button
              key={quantity}
              type="button"
              variant={isSelected ? "default" : "outline"}
              onClick={() => handlePresetQuantityClick(quantity)}
              disabled={disabled}
              size="sm"
              className={`h-8 text-xs transition-all duration-200 ${
                isSelected 
                  ? "bg-orange-600 hover:bg-orange-700 text-white shadow-md" 
                  : "border border-orange-200 hover:border-orange-400 hover:bg-orange-50"
              }`}
            >
              <ChefHat className="mr-1 h-3 w-3" />
              {formatQuantityText(quantity)}
            </Button>
          );
        })}
      </div>

      {/* Quantity Selector */}
      <Select
        value={selectedQuantity.toString()}
        onValueChange={handleSelectorChange}
        disabled={disabled}
      >
        <SelectTrigger className="h-8 text-sm border border-gray-200 focus:border-orange-400">
          <SelectValue placeholder="Otras cantidades" />
        </SelectTrigger>
        <SelectContent>
          {allQuantities.map((quantity) => (
            <SelectItem key={quantity} value={quantity.toString()} className="text-sm">
              {formatQuantityText(quantity)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}