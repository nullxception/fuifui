import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", ...props }, ref) => {
    const baseStyles =
      "inline-flex backdrop-blur-md items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

    const variants = {
      primary:
        "bg-primary/50 text-primary-foreground hover:bg-primary-hover/50 shadow-sm",
      secondary:
        "bg-secondary/50 text-secondary-foreground hover:bg-secondary-hover/50 shadow-sm",
      ghost: "hover:bg-surface-hover/50 text-muted-foreground hover:text-white",
      danger: "bg-pink-500/40 text-white hover:bg-pink-500/40 shadow-sm",
      outline:
        "border border-border bg-transparent hover:bg-surface-hover text-white",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 py-2 text-sm",
      lg: "h-12 px-8 text-base",
      icon: "h-10 w-10",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
