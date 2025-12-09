import { Button } from "client/components/ui/button";
import {
  ImageIcon,
  SettingsIcon,
  ZapIcon,
  type LucideIcon,
} from "lucide-react";
import { useLocation } from "wouter";

function NavButton({
  isActive = false,
  icon = ImageIcon,
  ...props
}: React.ComponentProps<"button"> & {
  isActive?: boolean;
  icon?: LucideIcon;
}) {
  const Icon = icon;
  return (
    <Button
      variant={isActive ? null : "ghost"}
      size="sm"
      className={`flex h-13 items-center justify-center rounded-3xl p-4 ${isActive ? "bg-primary/40 text-foreground" : "text-foreground/50"}`}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        <Icon />
        {isActive && <span className="text-xs">{props.children}</span>}
      </div>
    </Button>
  );
}

export function MobileNav() {
  const [location, navigate] = useLocation();

  return (
    <>
      <footer className="fixed bottom-0 z-1 flex h-18 w-full items-center justify-center md:hidden">
        <div className="container flex h-full max-w-screen-2xl items-center justify-around rounded-t-2xl border border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
          <NavButton
            icon={ZapIcon}
            onClick={() => navigate("/")}
            isActive={location === "/"}
          >
            Diffusion
          </NavButton>
          <NavButton
            icon={ImageIcon}
            onClick={() => navigate("/gallery")}
            isActive={location.startsWith("/gallery")}
          >
            Gallery
          </NavButton>

          <NavButton
            icon={SettingsIcon}
            isActive={location === "/settings"}
            onClick={() => navigate("/settings")}
          >
            Settings
          </NavButton>
        </div>
      </footer>
    </>
  );
}
