import { Route, Switch } from "wouter";
import { BackgroundLayer } from "./components/customized/BackgroundLayer";
import { Header } from "./components/customized/Header";
import { ThemeProvider } from "./components/theme-provider";
import TextToImage from "./dashboard";
import Gallery from "./gallery";
import SettingsPopup from "./settings/SettingsPopup";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <BackgroundLayer />
      <div className="app scrollbar-thin flex h-screen w-full flex-1 flex-col overflow-y-auto font-sans text-foreground scrollbar-thumb-accent scrollbar-track-transparent selection:bg-primary selection:text-primary-foreground">
        <Header />
        <Switch>
          <Route path="/gallery" nest>
            <Route component={Gallery} />
          </Route>
          <Route component={TextToImage} />
        </Switch>
        <SettingsPopup />
      </div>
    </ThemeProvider>
  );
}
