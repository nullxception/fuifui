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
            <input
              type="number"
              value={props.value}
              onChange={props.onChange}
              className="flex h-8 w-20 border border-border bg-surface/70 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            />
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
