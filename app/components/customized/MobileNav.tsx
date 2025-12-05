import { Button } from "@/components/ui/button";
import { useAppStore } from "app/stores";
import { SettingsIcon } from "lucide-react";
import { useLocation } from "wouter";

export const MobileNav = () => {
  const { setShowSettings } = useAppStore();
  const [location, navigate] = useLocation();

  return (
    <>
      <footer className="fixed bottom-0 z-50 flex h-16 w-full items-center justify-center p-2 md:hidden">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between rounded-2xl border border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="flex items-center gap-2">
            <h1
              className="bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-xl font-bold text-transparent"
              onClick={() => navigate("/")}
            >
              fui²
            </h1>
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-secondary/50 p-1">
            <Button
              variant={location === "/" ? "default" : "ghost"}
              size="sm"
              onClick={() => navigate("/")}
            >
              Diffusion
            </Button>
            <Button
              variant={location.startsWith("/gallery") ? "default" : "ghost"}
              size="sm"
              onClick={() => navigate("/gallery")}
            >
              Gallery
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(true)}
            title="Settings"
          >
            <SettingsIcon />
          </Button>
        </div>
      </footer>
    </>
  );
};
