import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="h-screen font-sans text-white selection:bg-primary selection:text-primary-foreground lg:overflow-hidden">
      <div className="relative flex h-full flex-col">{children}</div>
    </div>
  );
};
