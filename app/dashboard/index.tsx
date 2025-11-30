import { Button } from "@/components/ui/button";
import { CircleStopIcon, ImageIcon, TerminalIcon, ZapIcon } from "lucide-react";
import { useEffect } from "react";
import { sendJson } from "server/ws";
import { optimizePrompt } from "../lib/metadataParser";
import {
  useAppStore,
  useDiffusionConfig,
  useDiffusionJobs,
  useGallery,
  useModels,
} from "../stores";
import ConsoleOutput from "./ConsoleOutput";
import ControlPanel from "./ControlPanel";
import ImageDisplay from "./ImageDisplay";

export default function TextToImage() {
  const { outputTab, setOutputTab } = useAppStore();
  const { fetchModels } = useModels();
  const store = useDiffusionConfig();
  const { image, connect, jobId, clearLogs, ws, stop } = useDiffusionJobs();
  const isProcessing = jobId.length > 1;
  const { fetchImages } = useGallery();

  const handleDiffusion = () => {
    if (jobId.length > 1) {
      stop(jobId);
    } else {
      store.updateAll({
        prompt: optimizePrompt(store.params.prompt),
        negativePrompt: optimizePrompt(store.params.negativePrompt),
      });
      setOutputTab("console");
      clearLogs();
      sendJson(ws, { action: "txt2img:start", data: store.params });
    }
  };

  useEffect(() => {
    connect(fetchImages, setOutputTab);
  }, [connect, fetchImages, setOutputTab]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  return (
    <main className="container mx-auto flex min-h-0 max-w-screen-2xl flex-1 flex-col lg:overflow-hidden">
      <div className="flex flex-col gap-4 p-2 lg:h-full lg:flex-row">
        {/* Left Side: Image/Console */}
        <div className="mb-4 flex min-h-0 flex-1 flex-col overflow-clip rounded-xl border border-border">
          <div className="flex min-h-[50vh] flex-1 flex-col overflow-hidden bg-background/20 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2 border-b border-border/40 bg-background/20 p-3">
              <Button
                variant={outputTab === "image" ? "default" : "outline"}
                size="sm"
                onClick={() => setOutputTab("image")}
                className="w-1/4"
              >
                <ImageIcon />
                Image
              </Button>
              <Button
                variant={outputTab === "console" ? "default" : "outline"}
                size="sm"
                onClick={() => setOutputTab("console")}
                className="w-1/4"
              >
                <TerminalIcon />
                Console
              </Button>
            </div>

            <div className="relative min-h-0 w-full flex-1">
              {outputTab === "image" ? (
                <ImageDisplay image={image} isProcessing={isProcessing} />
              ) : (
                <ConsoleOutput />
              )}
            </div>
          </div>
          {/* Generate Button */}
          <div className="rounded-xl border border-r-0 border-b-0 border-l-0 border-border bg-background/20 p-2 backdrop-blur-sm">
            <Button
              onClick={handleDiffusion}
              variant={isProcessing ? "destructive" : "default"}
              size="lg"
              className="w-full rounded-xl"
            >
              {isProcessing ? (
                <>
                  <CircleStopIcon className="animate-pulse" />
                  Stop Generation
                </>
              ) : (
                <>
                  <ZapIcon />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Side: Control Panel */}
        <ControlPanel />
      </div>
    </main>
  );
}
