import React from "react";

export function Footer({
  className = "",
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <footer className={`mx-auto max-w-7xl px-8 py-4 text-center ${className}`}>
      <p className="text-sm text-gray-400">too much neovim, ai, and coffee</p>
    </footer>
  );
}
