import { BackgroundLayer } from "./components/customized/BackgroundLayer";
import { Header } from "./components/customized/Header";
import { Layout } from "./components/customized/Layout";
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
      <Layout>
        <Header />
        <main className="container mx-auto flex min-h-0 max-w-screen-2xl flex-1 flex-col lg:overflow-hidden">
          {activeTab === "gallery" ? <Gallery /> : <TextToImage />}
        </main>
        <SettingsPopup />
        <ImageLightbox />
      </Layout>
    </ThemeProvider>
  );
}
