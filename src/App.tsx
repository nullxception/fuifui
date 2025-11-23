import { useRef, useEffect } from "react";
import ControlPanel from "./components/ControlPanel";
import ImageDisplay from "./components/ImageDisplay";
import Gallery from "./components/Gallery";
import ConsoleOutput from "./components/ConsoleOutput";
import SettingsPopup from "./components/SettingsPopup";
import BackgroundLayer from "./components/BackgroundLayer";
import { Layout } from "./components/Layout";
import { Button } from "./components/ui/Button";
import {
  useAppStore,
  useDiffusionStore,
  useDataStore,
  useDiffusionConfigStore,
  useBackgroundSettingsStore,
} from "./stores";

import { optimizePrompt } from "./utils/metadataParser";
import type { DiffusionParams } from "../server/types";
import { BoltIcon } from "@heroicons/react/24/outline";
import { Cog6ToothIcon, StopCircleIcon } from "@heroicons/react/24/solid";

function App() {
  // Use stores instead of local state
  const {
    activeTab,
    outputTab,
    showSettings,
    isProcessing,
    setActiveTab,
    setOutputTab,
    setShowSettings,
    setIsProcessing,
  } = useAppStore();

  const { imageUrl, logs, setImageUrl, addLog, clearLogs } =
    useDiffusionStore();

  const { fetchModels, fetchVaes } = useDataStore();

  const store = useDiffusionConfigStore();
  const { bg, setBg } = useBackgroundSettingsStore();

  const eventSourceRef = useRef<EventSource | null>(null);

  const startDiffusion = async (params: DiffusionParams) => {
    setIsProcessing(true);
    clearLogs();

    try {
      // First, create a job by POSTing to /api/diffuse
      const response = await fetch("/api/diffuse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Failed to create job: ${response.statusText}`);
      }

      const { jobId } = await response.json();

      // Then, start streaming from /api/diffusions with the job ID
      const eventSource = new EventSource(`/api/diffusions?id=${jobId}`);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        const logData = JSON.parse(event.data);
        addLog(logData);
      };

      eventSource.addEventListener("complete", (event) => {
        const data = JSON.parse(event.data);
        if (data.success) {
          setImageUrl(`${data.imageUrl}?t=${Date.now()}`);
        }
        eventSource.close();
        eventSourceRef.current = null;
        setIsProcessing(false);
        setOutputTab("image");
      });

      eventSource.addEventListener("error", (event) => {
        console.error("Diffusion error:", event);
        eventSource.close();
        eventSourceRef.current = null;
        setIsProcessing(false);
      });

      eventSource.onerror = () => {
        eventSource.close();
        eventSourceRef.current = null;
        setIsProcessing(false);
      };
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate image. Check console for details.");
      setIsProcessing(false);
    }
  };

  const handleStop = async () => {
    try {
      // Call the stop API endpoint
      await fetch("/api/stop", { method: "POST" });
    } catch (error) {
      console.error("Error stopping diffusion:", error);
    }

    // Close the event source
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsProcessing(false);
  };

  const handleDiffusion = () => {
    if (isProcessing) {
      handleStop();
    } else {
      store.updateAll({
        prompt: optimizePrompt(store.params.prompt),
        negativePrompt: optimizePrompt(store.params.negativePrompt),
      });
      setOutputTab("console");
      startDiffusion(store.params);
    }
  };

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  useEffect(() => {
    fetchVaes();
  }, [fetchVaes]);

  return (
    <>
      <BackgroundLayer bg={bg} />
      <Layout>
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 flex justify-center">
          <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-2">
              <h1
                className="text-xl font-bold bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
                onClick={() => setActiveTab("generate")}
              >
                fui²
              </h1>
            </div>

            <nav className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg">
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
                <Cog6ToothIcon className="w-5 h-5" />
              </Button>
            </nav>
          </div>
        </header>

        <main className="flex-1 container max-w-screen-2xl mx-auto lg:overflow-hidden flex flex-col min-h-0">
          {activeTab === "generate" ? (
            <div className="flex flex-col lg:flex-row gap-4 p-2 lg:h-full">
              {/* Left Side: Image/Console */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 flex flex-col rounded-t-xl overflow-hidden border border-border bg-black/20 backdrop-blur-sm min-h-[50vh]">
                  <div className="flex items-center gap-2 p-3 border-b border-border/40 bg-black/20">
                    <Button
                      variant={outputTab === "image" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setOutputTab("image")}
                      className="backdrop-blur-md bg-black/40 hover:bg-black/60"
                    >
                      Image
                    </Button>
                    <Button
                      variant={outputTab === "console" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setOutputTab("console")}
                      className="backdrop-blur-md bg-black/40 hover:bg-black/60"
                    >
                      Console
                    </Button>
                  </div>

                  <div className="flex-1 min-h-0 w-full relative">
                    {outputTab === "image" ? (
                      <ImageDisplay
                        imageUrl={imageUrl}
                        isProcessing={isProcessing}
                      />
                    ) : (
                      <ConsoleOutput logs={logs} />
                    )}
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleDiffusion}
                  variant={isProcessing ? "danger" : "primary"}
                  size="lg"
                  className="w-full rounded-t-none rounded-b-xl"
                >
                  {isProcessing ? (
                    <>
                      <StopCircleIcon className="w-5 h-5 mr-2 animate-pulse" />
                      Stop Generation
                    </>
                  ) : (
                    <>
                      <BoltIcon className="w-5 h-5 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              </div>

              {/* Right Side: Control Panel */}
              <ControlPanel />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-secondary scrollbar-track-transparent p-2">
              <Gallery isActive={activeTab === "gallery"} />
            </div>
          )}
        </main>

        <SettingsPopup
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          bg={bg}
          setBg={setBg}
        />
      </Layout>
    </>
  );
}

export default App;
