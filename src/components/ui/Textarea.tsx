import React from "react";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <textarea
        className={`flex w-full rounded-md border border-border 
          bg-surface/70 px-3 py-2 text-sm text-white placeholder:text-muted-foreground 
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary 
          disabled:cursor-not-allowed disabled:opacity-50 scrollbar-none 
          scrollbar-thumb-secondary scrollbar-track-transparent resize-y ${className}`}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";
