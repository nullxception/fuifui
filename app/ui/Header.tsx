import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { useAppStore } from "../stores";
import { Button } from "../ui/Button";

export const Header = () => {
  const { activeTab, setActiveTab, setShowSettings } = useAppStore();

  return (
    <header className="sticky top-0 z-50 flex w-full justify-center border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <h1
            className="bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-xl font-bold text-transparent"
            onClick={() => setActiveTab("generate")}
          >
            fui²
          </h1>
        </div>

        <nav className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-secondary/50 p-1">
            <Button
              variant={activeTab === "generate" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("generate")}
            >
              Diffusion
            </Button>
            <Button
              variant={activeTab === "gallery" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("gallery")}
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
            <Cog6ToothIcon className="h-5 w-5" />
          </Button>
        </nav>
      </div>
    </header>
  );
};
