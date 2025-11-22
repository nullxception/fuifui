import React from "react";

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  valueDisplay?: React.ReactNode;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className = "", label, valueDisplay, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {(label || valueDisplay) && (
          <div className="flex justify-between items-center">
            {label && (
              <label className="text-gray-200 block text-xs font-medium uppercase tracking-wider">
                {label}
              </label>
            )}
            {valueDisplay && (
              <span className="text-xs text-muted-foreground font-mono font-medium">
                {valueDisplay}
              </span>
            )}
          </div>
        )}
        <input
          type="range"
          ref={ref}
          className={`w-full h-2 bg-primary/50 rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary-hover transition-all ${className}`}
          {...props}
        />
      </div>
    );
  },
);
Slider.displayName = "Slider";
