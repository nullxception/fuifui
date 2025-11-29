import { Badge } from "@/components/ui/badge";
import { Slider as SliderPrimitive } from "radix-ui";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface SliderProps {
  label?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (e: number) => void;
  valueDisplay?: React.ReactNode;
  className?: string;
}

export const SliderInput: React.FC<SliderProps> = ({
  className = "",
  label,
  valueDisplay,
  min,
  max,
  step,
  value,
  onChange,
}) => {
  const [sliderValue, setSliderValue] = useState(value);

  const handleSliderChange = (value: number) => {
    setSliderValue(value);
  };

  useEffect(() => {
    onChange(sliderValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sliderValue]);

  return (
    <div className="w-full space-y-4">
      {(label || valueDisplay) && (
        <div className="flex items-center justify-between">
          {label && <Label>{label}</Label>}
          <Input
            type="number"
            value={value}
            step={step}
            onChange={(e) => handleSliderChange(e.target.valueAsNumber)}
            className="bg-surface/70 flex h-8 w-20 border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      )}
      <div className="relative flex w-full flex-col items-center">
        <SliderPrimitive.Root
          defaultValue={[sliderValue]}
          min={min}
          max={max}
          step={step}
          value={[sliderValue]}
          onValueChange={(e) => handleSliderChange(e[0] || 0)}
          className={`relative flex w-full touch-none items-center pb-2 select-none ${className}`}
        >
          <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
            <SliderPrimitive.Range className="absolute h-full bg-primary" />
          </SliderPrimitive.Track>

          <SliderPrimitive.Thumb className="group block h-4 w-4 rounded-full border border-primary/50 bg-background shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50">
            {/* Sticky label */}
            <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-0 transition-transform group-hover:scale-100">
              {value}
            </Badge>
          </SliderPrimitive.Thumb>
        </SliderPrimitive.Root>
      </div>
    </div>
  );
};
SliderInput.displayName = "Slider";
