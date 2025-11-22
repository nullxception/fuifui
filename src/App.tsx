import { useRef, useEffect } from "react";
import type { DiffusionParams } from "../server/types";
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

  const diffusionConfig = useDiffusionConfigStore();
  const { backgroundSettings, setBackgroundSettings } =
    useBackgroundSettingsStore();

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
      const newPrompt = optimizePrompt(diffusionConfig.prompt);
      const newNegPrompt = optimizePrompt(diffusionConfig.negativePrompt);
      diffusionConfig.updatePrompt(newPrompt);
      diffusionConfig.updateNegativePrompt(newNegPrompt);

      // Use current diffusion config state
      startDiffusion({
        model: diffusionConfig.model,
        vae: diffusionConfig.vae,
        prompt: diffusionConfig.prompt,
        negativePrompt: diffusionConfig.negativePrompt,
        steps: diffusionConfig.steps,
        cfgScale: diffusionConfig.cfgScale,
        seed: diffusionConfig.seed,
        width: diffusionConfig.width,
        height: diffusionConfig.height,
        flashAttention: diffusionConfig.flashAttention,
        samplingMethod: diffusionConfig.samplingMethod,
        scheduler: diffusionConfig.scheduler,
        rng: diffusionConfig.rng,
        samplerRng: diffusionConfig.samplerRng,
        diffusionConvDirect: diffusionConfig.diffusionConvDirect,
        vaeConvDirect: diffusionConfig.vaeConvDirect,
        threads: diffusionConfig.threads,
        offloadToCpu: diffusionConfig.offloadToCpu,
      });
    }
  };

  useEffect(() => {
    fetchModels();
    fetchVaes();
  }, [fetchModels, fetchVaes]);

  return (
    <>
      <BackgroundLayer settings={backgroundSettings} />
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

            <nav className="flex items-center gap-4">
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
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </Button>
            </nav>
          </div>
        </header>

        <main className="flex-1 container max-w-screen-2xl mx-auto lg:overflow-hidden flex flex-col min-h-0">
          {activeTab === "generate" ? (
            <div className="flex flex-col lg:flex-row gap-6 p-4 lg:h-full">
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
                      <svg
                        className="w-5 h-5 mr-2 animate-pulse"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <rect
                          x="6"
                          y="6"
                          width="12"
                          height="12"
                          strokeWidth="2"
                        />
                      </svg>
                      Stop Generation
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      Generate
                    </>
                  )}
                </Button>
              </div>

              {/* Right Side: Control Panel */}
              <ControlPanel />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-secondary scrollbar-track-transparent p-4 lg:p-6">
              <Gallery isActive={activeTab === "gallery"} />
            </div>
          )}
        </main>

        <SettingsPopup
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          backgroundSettings={backgroundSettings}
          setBackgroundSettings={setBackgroundSettings}
        />
      </Layout>
    </>
  );
}

export default App;
