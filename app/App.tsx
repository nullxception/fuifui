import { AnimatePresence } from "framer-motion";
import { useRoute } from "wouter";
import { BackgroundLayer } from "./components/customized/BackgroundLayer";
import { Header } from "./components/customized/Header";
import { ThemeProvider } from "./components/theme-provider";
import TextToImage from "./dashboard";
import Gallery from "./gallery";
import SettingsPopup from "./settings/SettingsPopup";

const AnimationSettings = {
  transition: { duration: 0.3 },
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function App() {
  const [isGallery] = useRoute("/gallery/*?");
  const [isIndex] = useRoute("/");

  return (
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <BackgroundLayer />
      <div className="app scrollbar-thin flex h-screen w-full flex-1 flex-col overflow-y-scroll font-sans text-foreground scrollbar-thumb-accent scrollbar-track-transparent selection:bg-primary selection:text-primary-foreground">
        <Header />
        <AnimatePresence>
          {isGallery && <Gallery {...AnimationSettings} />}
          {isIndex && <TextToImage {...AnimationSettings} />}
        </AnimatePresence>
        <SettingsPopup />
      </div>
    </ThemeProvider>
  );
}
