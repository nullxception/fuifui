import React from "react";

export function Footer({
  className = "",
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <footer
      className={`mx-auto mb-16 max-w-7xl px-8 py-4 text-center md:mb-0 ${className}`}
    >
      <p className="text-sm text-gray-400">too much neovim, ai, and coffee</p>
    </footer>
  );
}
