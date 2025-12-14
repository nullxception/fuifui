import { QueryClientProvider } from "@tanstack/react-query";
import {
  createTRPCClient,
  httpBatchLink,
  httpLink,
  isNonJsonSerializable,
  splitLink,
} from "@trpc/client";
import { AnimatePresence } from "framer-motion";
import { StrictMode, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import type { AppRouter } from "server/rpc";
import { useRoute } from "wouter";
import { BackgroundLayer } from "./components/BackgroundLayer";
import { Header } from "./components/Header";
import { MobileNav } from "./components/MobileNav";
import { ThemeProvider } from "./components/theme-provider";
import { Converter } from "./converter/Converter";
import { TextToImage } from "./dashboard";
import { Gallery } from "./gallery";
import ImageLightbox from "./gallery/ImageLightbox";
import "./index.css";
import { queryClient, TRPCProvider } from "./query";
import Settings from "./settings/Settings";

const AnimationSettings = {
  transition: { duration: 0.3 },
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

function Routes() {
  const [isSettings] = useRoute("/settings");
  const [isConverter] = useRoute("/converter");
  const [isLightbox, lightboxParams] = useRoute("/:page(gallery|result)/:id");
  const lightboxPage = lightboxParams?.["page(gallery|result)"] ?? "gallery";
  const [isGallery] = useRoute("/gallery");
  const [isIndex] = useRoute("/");
  const ref = useRef<HTMLDivElement>(null);
  const [containerTop, setContainerTop] = useState(0);

  const handleScroll = () => {
    setContainerTop(ref?.current?.scrollTop ?? 0);
  };

  useEffect(() => {
    const container = ref?.current;
    container?.addEventListener("scroll", handleScroll);

    return () => {
      container?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="scrollbar-thin flex h-screen w-full flex-1 flex-col overflow-y-scroll pb-18 font-sans text-foreground scrollbar-thumb-accent scrollbar-track-transparent selection:bg-primary selection:text-primary-foreground md:pb-0"
    >
      <Header containerTop={containerTop} />
      <AnimatePresence>
        {isSettings && <Settings {...AnimationSettings} />}
        {isConverter && <Converter {...AnimationSettings} />}
        {(isGallery || (isLightbox && lightboxPage === "gallery")) && (
          <Gallery {...AnimationSettings} />
        )}
        {(isIndex || (isLightbox && lightboxPage === "result")) && (
          <TextToImage {...AnimationSettings} />
        )}
        {isLightbox && <ImageLightbox key="imgLightbox" />}
      </AnimatePresence>
      <MobileNav />
    </div>
  );
}

function App() {
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        splitLink({
          condition: (op) => isNonJsonSerializable(op.input),
          true: httpLink({ url: "/rpc" }),
          false: httpBatchLink({ url: "/rpc" }),
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
          <BackgroundLayer />
          <Routes />
          <div id="modal-root"></div>
        </ThemeProvider>
      </TRPCProvider>
    </QueryClientProvider>
  );
}

const elem = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

if (import.meta.hot) {
  const root = (import.meta.hot.data.root ??= createRoot(elem));
  root.render(app);
} else {
  // The hot module reloading API is not available in production.
  createRoot(elem).render(app);
}
