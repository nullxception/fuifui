import { useMutation, useQuery } from "@tanstack/react-query";
import { Footer } from "client/components/Footer";
import { Logo } from "client/components/Header";
import { Button } from "client/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "client/components/ui/card";
import {
  InputGroup,
  InputGroupInput,
  InputGroupText,
} from "client/components/ui/input-group";
import { Label } from "client/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "client/components/ui/select";
import ConsoleOutput from "client/dashboard/ConsoleOutput";
import { useTRPC } from "client/query";
import { useJobs } from "client/stores/useJobs";
import { motion, type HTMLMotionProps } from "framer-motion";
import { AlertTriangleIcon, CircleStopIcon, ZapIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { GGML_WEIGHTS_TYPE } from "server/types";

export default function Converter(props: HTMLMotionProps<"div">) {
  const rpc = useTRPC();
  const { data: models } = useQuery(rpc.listModels.queryOptions());
  const { jobStatus, checkJobs, connectToJob, setError, logs } = useJobs();

  const { data: process } = useQuery(rpc.listJobs.queryOptions("convert"));

  const filteredModels = models?.checkpoints.filter(
    (m) => !m.endsWith(".gguf"),
  );

  const [model, setModel] = useState("");
  const [output, setOutput] = useState("");
  const [type, setType] = useState("q8_0");

  const updateOutput = (newModel: string, newType: string) => {
    if (newModel && newType) {
      const nameWithoutExt = newModel.substring(0, newModel.lastIndexOf("."));
      setOutput(`${nameWithoutExt}.${newType}.gguf`);
    }
  };

  const handleModelChange = (val: string) => {
    setModel(val);
    updateOutput(val, type);
  };

  const handleTypeChange = (val: string) => {
    setType(val);
    updateOutput(model, val);
  };

  const isOutputExists = models?.checkpoints.includes(output);
  const jobState = jobStatus("convert");
  const jobId = jobState?.id;
  const quantizationStart = useMutation(
    rpc.startQuantization.mutationOptions({
      onError(err) {
        setError("convert", err.message);
      },
      onSuccess(data) {
        connectToJob(data.jobId, "convert");
      },
    }),
  );
  const quantizationStop = useMutation(rpc.stopQuantization.mutationOptions());

  const isProcessing = jobState?.isProcessing;

  const handleConvert = () => {
    if (isProcessing && jobId) {
      quantizationStop.mutate(jobId);
    } else {
      quantizationStart.mutate({ model, output, type });
    }
  };

  useEffect(() => {
    if (process) {
      checkJobs(process);
    }
  }, [checkJobs, process]);

  return (
    <motion.div
      className="container mx-auto flex min-h-0 max-w-screen-2xl flex-1 flex-col lg:overflow-hidden"
      {...props}
    >
      <div className="flex items-center p-4 md:hidden">
        <Logo />
      </div>
      <div className="flex flex-col gap-4 p-2 lg:h-full lg:flex-row">
        {/* Left Side: Image/Console */}
        <div className="mb-4 flex min-h-0 flex-1 flex-col overflow-clip rounded-xl border border-border">
          <div className="relative min-h-0 w-full flex-1">
            <ConsoleOutput logs={logs.filter((log) => log.jobId === jobId)} />
          </div>
        </div>
        <div className="flex w-full flex-col lg:max-h-screen lg:w-[40vw]">
          <Card className="scrollbar-thin w-full flex-1 grow space-y-4 overflow-y-auto py-4 backdrop-blur-md scrollbar-thumb-secondary scrollbar-track-transparent lg:max-h-full lg:w-[40vw] lg:shrink-0">
            <CardHeader className="py-4">
              <CardTitle>Model Weight Converter</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-stretch justify-center space-y-4">
              <div className="space-y-2">
                <Label>Model</Label>
                <Select value={model} onValueChange={handleModelChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredModels?.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-row gap-4">
                <div className="space-y-2">
                  <Label>Quantization</Label>
                  <Select value={type} onValueChange={handleTypeChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GGML_WEIGHTS_TYPE.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grow space-y-2">
                  <Label>Output</Label>
                  <InputGroup>
                    <InputGroupText className="ml-4">
                      checkpoints/
                    </InputGroupText>
                    <InputGroupInput
                      value={output}
                      onChange={(e) => setOutput(e.target.value)}
                      placeholder={`model.${type}.gguf`}
                    />
                  </InputGroup>
                  {isOutputExists && (
                    <div className="flex items-center gap-2 text-sm text-yellow-500">
                      <AlertTriangleIcon className="h-4 w-4" />
                      <span>
                        Warning: Output file already exists and will be
                        overwritten.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={handleConvert}
                variant={isProcessing ? "destructive" : "default"}
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <CircleStopIcon className="animate-pulse" />
                    Stop Quantization
                  </>
                ) : (
                  <>
                    <ZapIcon />
                    Quantizate
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          <Footer className="col-span-full flex justify-center p-4" />
        </div>
      </div>
    </motion.div>
  );
}
