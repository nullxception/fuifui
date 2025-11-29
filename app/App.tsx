import { BackgroundLayer } from "./components/customized/BackgroundLayer";
import { Header } from "./components/customized/Header";
import { ThemeProvider } from "./components/theme-provider";
import TextToImage from "./dashboard";
import Gallery from "./gallery";
import ImageLightbox from "./gallery/ImageLightbox";
import SettingsPopup from "./settings/SettingsPopup";
import { useAppStore } from "./stores";

export default function App() {
  const { activeTab } = useAppStore();

  return (
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <BackgroundLayer />
      <div className="scrollbar-thin flex h-screen w-full flex-1 flex-col overflow-y-auto font-sans text-foreground scrollbar-thumb-accent scrollbar-track-transparent selection:bg-primary selection:text-primary-foreground">
        <Header />
        {activeTab === "gallery" ? <Gallery /> : <TextToImage />}
        <SettingsPopup />
        <ImageLightbox />
      </div>
    </ThemeProvider>
  );
}
