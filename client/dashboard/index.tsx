import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "client/components/ui/button";
import { useTRPC } from "client/query";
import { useAppStore } from "client/stores/useAppStore";
import { motion, type HTMLMotionProps } from "framer-motion";
import { CircleStopIcon, ImageIcon, TerminalIcon, ZapIcon } from "lucide-react";
import { forwardRef, useEffect } from "react";
import { optimizePrompt } from "../lib/metadataParser";
import { useJobs } from "../stores/useJobs";
import ConsoleOutput from "./ConsoleOutput";
import ControlPanel from "./ControlPanel";
import ImageDisplay from "./ImageDisplay";
import { useDiffusionConfig } from "./useDiffusionConfig";

const TextToImage = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  (props, ref) => {
    const { outputTab, setOutputTab } = useAppStore();
    const { jobStatus, checkJobs, connectToJob, setError, logs } = useJobs();
    const store = useDiffusionConfig();
    const rpc = useTRPC();
    const { data: models } = useQuery(rpc.listModels.queryOptions());
    const { data: process } = useQuery(rpc.listJobs.queryOptions("txt2img"));
    const jobState = jobStatus("txt2img");
    const jobId = jobState?.id;
    const diffusionStart = useMutation(
      rpc.startDiffusion.mutationOptions({
        onError() {
          if (jobId) setError(jobId, "txt2img", "Failed to generate image");
        },
        onSuccess(data) {
          connectToJob(data.jobId, "txt2img");
        },
      }),
    );

    const isProcessing = jobState?.isProcessing;
    const image = jobState?.image;
    const diffusionStop = useMutation(rpc.stopDiffusion.mutationOptions());

    useEffect(() => {
      if (process) {
        checkJobs(process);
      }
    }, [checkJobs, process]);

    const handleDiffusion = async () => {
      if (isProcessing && jobId) {
        diffusionStop.mutate(jobId);
      } else {
        await store.updateAll({
          prompt: optimizePrompt(store.params.prompt, models),
          negativePrompt: optimizePrompt(store.params.negativePrompt, models),
        });
        diffusionStart.mutate(store.params);
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
                  <ImageDisplay
                    image={image}
                    isProcessing={isProcessing ?? false}
                  />
                ) : (
                  <ConsoleOutput logs={logs.filter((x) => x.jobId === jobId)} />
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
