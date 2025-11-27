import { ChevronDownIcon, PlusIcon } from "@heroicons/react/24/outline";
import React from "react";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={`flex h-10 w-full appearance-none items-center justify-between border border-border bg-surface/70 px-3 py-2 pr-8 text-sm text-white placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
          <ChevronDownIcon className="h-4 w-4" />
        </div>
      </div>
    );
  },
);

Select.displayName = "Select";

export const SelectAdd = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={`pr-8text-sm flex h-10 w-full appearance-none items-center justify-between border border-border bg-surface/70 px-3 py-2 text-white placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
          <PlusIcon className="h-4 w-4" />
        </div>
      </div>
    );
  },
);

SelectAdd.displayName = "SelectAdd";
