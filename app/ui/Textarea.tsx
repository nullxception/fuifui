import React from "react";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <textarea
        className={`scrollbar-none flex w-full resize-y border border-border bg-surface/70 px-3 py-2 text-sm text-white scrollbar-thumb-secondary scrollbar-track-transparent placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";
