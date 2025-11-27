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
          <div className="flex items-center justify-between">
            {label && (
              <label className="block text-xs font-medium tracking-wider text-gray-200 uppercase">
                {label}
              </label>
            )}
            <input
              type="number"
              value={props.value}
              onChange={props.onChange}
              className="flex h-8 w-20 border border-border bg-surface/70 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        )}
        <input
          type="range"
          ref={ref}
          className={`h-2 w-full cursor-pointer appearance-none rounded-lg bg-primary/50 accent-primary transition-all hover:accent-primary-hover ${className}`}
          {...props}
        />
      </div>
    );
  },
);
Slider.displayName = "Slider";
