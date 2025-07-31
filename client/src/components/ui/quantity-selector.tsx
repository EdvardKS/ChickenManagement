import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  label = "Cantidad de pollos (kg)", 
  disabled = false,
  min = 0.5,
  max = 50,
  step = 0.5
}: QuantitySelectorProps) {
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  // Initialize with default value
  useEffect(() => {
    if (value !== undefined) {
      setSelectedQuantity(value);
    } else {
      // Default to 1 kg
      setSelectedQuantity(1);
      onChange(1);
    }
  }, []);

  // Update internal state when external value changes
  useEffect(() => {
    if (value !== undefined && value !== selectedQuantity) {
      setSelectedQuantity(value);
    }
  }, [value]);

  const handlePresetQuantityClick = (quantity: number) => {
    setSelectedQuantity(quantity);
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
    if (qty === 0.5) return "0.5 kg";
    if (qty === 1) return "1 kg";
    return `${qty} kg`;
  };

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <ChefHat className="h-4 w-4" />
        {label}
      </Label>
      
      {/* Preset quantity buttons */}
      <div className="grid grid-cols-2 gap-2">
        {PRESET_QUANTITIES.map((quantity) => (
          <Button
            key={quantity}
            type="button"
            variant={selectedQuantity === quantity ? "default" : "outline"}
            onClick={() => handlePresetQuantityClick(quantity)}
            disabled={disabled}
            className="h-10"
          >
            {formatQuantityText(quantity)}
          </Button>
        ))}
      </div>

      {/* Manual quantity input */}
      <div className="flex items-center gap-2">
        <Label htmlFor="manual-quantity" className="text-sm text-muted-foreground whitespace-nowrap">
          Otra cantidad:
        </Label>
        <div className="flex items-center gap-1 flex-1">
          <Input
            id="manual-quantity"
            type="number"
            value={selectedQuantity > 0 ? selectedQuantity : ""}
            onChange={handleManualQuantityChange}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            placeholder="1.5"
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground">kg</span>
        </div>
      </div>
      
      {/* Display selected quantity info */}
      {selectedQuantity > 0 && (
        <div className="text-sm text-muted-foreground bg-muted/50 rounded-md p-2">
          {selectedQuantity === 1 ? "1 pollo" : 
           selectedQuantity === 0.5 ? "Medio pollo" : 
           `${selectedQuantity} pollos`}
        </div>
      )}
    </div>
  );
}