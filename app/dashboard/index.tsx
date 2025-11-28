import { Button } from "@/components/ui/button";
import { CircleStopIcon, ZapIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import type { DiffusionParams } from "server/types";
import { optimizePrompt } from "../lib/metadataParser";
import {
  useAppStore,
  useDiffusionConfig,
  useDiffusionStatus,
  useModels,
} from "../stores";
import ConsoleOutput from "./ConsoleOutput";
import ControlPanel from "./ControlPanel";
import ImageDisplay from "./ImageDisplay";

export default function TextToImage() {
  const { outputTab, jobId, setOutputTab, setJobId } = useAppStore();
  const { imageUrl, logs, setImageUrl, addLog, clearLogs } =
    useDiffusionStatus();
  const { fetchModels } = useModels();
  const store = useDiffusionConfig();
  const eventSourceRef = useRef<EventSource | null>(null);

  const connectToJob = (id: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(`/api/jobs/${id}`);
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
      setJobId("");
      setOutputTab("image");
    });

    eventSource.addEventListener("error", (event) => {
      console.error("Diffusion error:", event);
      eventSource.close();
      eventSourceRef.current = null;
      setJobId("");
    });

    eventSource.onerror = () => {
      eventSource.close();
      eventSourceRef.current = null;
      setJobId("");
    };

    setOutputTab("console");
  };

  useEffect(() => {
    const checkActiveJobs = async () => {
      try {
        const response = await fetch("/api/jobs");
        if (response.ok) {
          const jobs = await response.json();
          if (Array.isArray(jobs) && jobs.length > 0) {
            // Connect to the most recent job
            const lastJobId = jobs[jobs.length - 1];
            setJobId(lastJobId);
            connectToJob(lastJobId);
          }
        }
      } catch (error) {
        console.error("Failed to check active jobs:", error);
      }
    };

    checkActiveJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startDiffusion = async (params: DiffusionParams) => {
    clearLogs();

    try {
      // First, create a job by POSTing to /api/txt2img
      const response = await fetch("/api/txt2img", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Failed to create job: ${response.statusText}`);
      }

      const resp = await response.json();

      // Then, start streaming from /api/jobs/:id
      setJobId(resp.jobId);
      connectToJob(resp.jobId);
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate image. Check console for details.");
      setJobId("");
    }
  };

  const handleStop = async () => {
    try {
      // Call the stop API endpoint
      await fetch(`/api/jobs/stop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId }),
      });
    } catch (error) {
      console.error("Error stopping diffusion:", error);
    }

    // Close the event source
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setJobId("");
  };

  const handleDiffusion = () => {
    if (jobId.length > 1) {
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

  return (
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
              Image
            </Button>
            <Button
              variant={outputTab === "console" ? "default" : "outline"}
              size="sm"
              onClick={() => setOutputTab("console")}
              className="w-1/4"
            >
              Console
            </Button>
          </div>

          <div className="relative min-h-0 w-full flex-1">
            {outputTab === "image" ? (
              <ImageDisplay
                imageUrl={imageUrl}
                isProcessing={jobId.length > 1}
              />
            ) : (
              <ConsoleOutput logs={logs} />
            )}
          </div>
        </div>
        {/* Generate Button */}
        <div className="rounded-xl border border-r-0 border-b-0 border-l-0 border-border bg-background/20 p-2 backdrop-blur-sm">
          <Button
            onClick={handleDiffusion}
            variant={jobId.length > 1 ? "destructive" : "default"}
            size="lg"
            className="w-full rounded-xl"
          >
            {jobId.length > 1 ? (
              <>
                <CircleStopIcon className="mr-2 h-5 w-5 animate-pulse" />
                Stop Generation
              </>
            ) : (
              <>
                <ZapIcon className="mr-2 h-5 w-5" />
                Generate
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Right Side: Control Panel */}
      <ControlPanel />
    </div>
  );
}
