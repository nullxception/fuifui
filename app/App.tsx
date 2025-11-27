import TextToImage from "./dashboard";
import Gallery from "./gallery";
import SettingsPopup from "./settings/SettingsPopup";
import { useAppStore } from "./stores";
import BackgroundLayer from "./ui/BackgroundLayer";
import { Header } from "./ui/Header";
import { Layout } from "./ui/Layout";

export default function App() {
  const { activeTab } = useAppStore();

  return (
    <>
      <BackgroundLayer />
      <Layout>
        <Header />
        <main className="container mx-auto flex min-h-0 max-w-screen-2xl flex-1 flex-col lg:overflow-hidden">
          {activeTab === "gallery" ? <Gallery /> : <TextToImage />}
        </main>
        <SettingsPopup />
      </Layout>
    </>
  );
}
