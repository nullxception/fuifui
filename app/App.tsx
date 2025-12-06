import { AnimatePresence } from "framer-motion";
import { useRoute } from "wouter";
import { BackgroundLayer } from "./components/customized/BackgroundLayer";
import { Header } from "./components/customized/Header";
import { MobileNav } from "./components/customized/MobileNav";
import { ThemeProvider } from "./components/theme-provider";
import TextToImage from "./dashboard";
import Gallery from "./gallery";
import Settings from "./settings/Settings";

const AnimationSettings = {
  transition: { duration: 0.3 },
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function App() {
  const [isSettings] = useRoute("/settings");
  const [isGallery] = useRoute("/gallery/*?");
  const [isIndex] = useRoute("/");

  return (
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <BackgroundLayer />
      <div className="scrollbar-thin flex h-screen w-full flex-1 flex-col overflow-y-scroll font-sans text-foreground scrollbar-thumb-accent scrollbar-track-transparent selection:bg-primary selection:text-primary-foreground">
        <Header />
        <AnimatePresence>
          {isGallery && <Gallery {...AnimationSettings} />}
          {isIndex && <TextToImage {...AnimationSettings} />}
          {isSettings && <Settings {...AnimationSettings} />}
        </AnimatePresence>
        <MobileNav />
      </div>
    </ThemeProvider>
  );
}
