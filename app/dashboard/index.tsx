import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/useAppStore";
import { motion, type HTMLMotionProps } from "framer-motion";
import { CircleStopIcon, ImageIcon, TerminalIcon, ZapIcon } from "lucide-react";
import { forwardRef, useEffect } from "react";
import { optimizePrompt } from "../lib/metadataParser";
import ConsoleOutput from "./ConsoleOutput";
import ControlPanel from "./ControlPanel";
import ImageDisplay from "./ImageDisplay";
import { useDiffusionConfig } from "./useDiffusionConfig";
import { useDiffusionJob } from "./useDiffusionJob";
import { useModels } from "./useModels";

const TextToImage = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  (props, ref) => {
    const { outputTab, setOutputTab } = useAppStore();
    const { image, isProcessing, start, stop, checkJobs } = useDiffusionJob();
    const store = useDiffusionConfig();
    const { models } = useModels();

    useEffect(() => {
      checkJobs();
    }, [checkJobs]);

    const handleDiffusion = async () => {
      if (isProcessing) {
        stop();
      } else {
        await store.updateAll({
          prompt: optimizePrompt(store.params.prompt, models),
          negativePrompt: optimizePrompt(store.params.negativePrompt, models),
        });
        start(store.params);
      }
    };

    return (
      <motion.div
        ref={ref}
        className="container mx-auto flex min-h-0 max-w-screen-2xl flex-1 flex-col lg:overflow-hidden"
        {...props}
      >
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
      </motion.div>
    );
  },
);

export default TextToImage;
