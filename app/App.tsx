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
        {activeTab === "gallery" ? <Gallery /> : <TextToImage />}
        <SettingsPopup />
        <ImageLightbox />
      </Layout>
    </ThemeProvider>
  );
}
