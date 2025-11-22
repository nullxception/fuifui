import React from "react";

export const Footer = ({
  className = "",
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <footer className={`max-w-7xl mx-auto px-8 py-4 text-center ${className}`}>
      <p className="text-gray-400 text-sm">too much neovim, ai, and coffee</p>
    </footer>
  );
};
