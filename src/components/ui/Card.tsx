import React from "react";

export const Card = ({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`rounded-xl border border-border bg-surface/70 text-white shadow-sm backdrop-blur-sm ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={` ${className}`} {...props}>
    {children}
  </div>
);
