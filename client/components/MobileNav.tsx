import { Button } from "client/components/ui/button";
import {
  AtomIcon,
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
      <footer className="fixed -bottom-1 z-1 flex h-18 w-full max-w-screen-2xl items-center justify-center rounded-t-2xl border border-b-0 border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 md:hidden">
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
          isActive={location.startsWith("/converter")}
          onClick={() => navigate("/converter")}
          icon={AtomIcon}
        >
          Converter
        </NavButton>

        <NavButton
          icon={SettingsIcon}
          isActive={location === "/settings"}
          onClick={() => navigate("/settings")}
        >
          Settings
        </NavButton>
      </footer>
    </>
  );
}
