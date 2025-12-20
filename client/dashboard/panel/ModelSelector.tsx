import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDiffusionConf } from "@/hooks/useDiffusionConfig";
import { useTRPC } from "@/lib/query";
import { useQuery } from "@tanstack/react-query";
import { diffusionModelTypeSchema } from "server/types/diffusionparams";
import { GGML_WEIGHTS_TYPE, quantizationSchema } from "server/types/ggml";

function ModelSelect() {
  const store = useDiffusionConf("model");
  const rpc = useTRPC();
  const { data } = useQuery(rpc.info.models.queryOptions());

  return (
    <div className="col-span-2 space-y-2 pt-2">
      <Label htmlFor="modelSelect">Model</Label>
      <Select value={store.value} onValueChange={(e) => store.update(e)}>
        <SelectTrigger id="modelSelect" className="w-full">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent className="bg-background/80 p-1 backdrop-blur-xs">
          <SelectGroup>
            {data &&
              data.checkpoints.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

function ModelTypeSelect() {
  const store = useDiffusionConf("modelType");
  return (
    <div className="space-y-2 pt-2">
      <Label htmlFor="modelTypeSelect">Model Type</Label>
      <Select
        value={store.value}
        onValueChange={(e) => {
          const parsed = diffusionModelTypeSchema.safeParse(e);
          if (parsed.success) {
            store.update(parsed.data);
          }
        }}
      >
        <SelectTrigger id="modelTypeSelect" className="w-full">
          <SelectValue placeholder="Select a model type" />
        </SelectTrigger>
        <SelectContent className="bg-background/80 p-1 backdrop-blur-xs">
          <SelectGroup>
            <SelectItem key="standalone" value="standalone">
              Standalone Model
            </SelectItem>
            <SelectItem key="full" value="full">
              Full Model
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

function VaeSelect() {
  const store = useDiffusionConf("vae");
  const rpc = useTRPC();
  const { data } = useQuery(rpc.info.models.queryOptions());

  return (
    <div className="space-y-2 pt-2">
      <Label htmlFor="vaeSelect">VAE</Label>
      <Select
        value={store.value ?? ""}
        onValueChange={(e) => {
          if (e === "unset") {
            store.unset();
            return;
          }
          store.update(e);
        }}
      >
        <SelectTrigger id="vaeSelect" className="w-full">
          <SelectValue placeholder="Select VAE" />
        </SelectTrigger>
        <SelectContent className="bg-background/80 p-1 backdrop-blur-xs">
          <SelectGroup>
            <SelectItem value="unset">unset</SelectItem>
            {data &&
              data.vaes.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

function ClipLSelect() {
  const store = useDiffusionConf("clipL");
  const rpc = useTRPC();
  const { data } = useQuery(rpc.info.models.queryOptions());

  return (
    <div className="space-y-2 pt-2">
      <Label htmlFor="clipLSSelect">CLIP-L</Label>
      <Select
        value={store.value ?? ""}
        onValueChange={(e) => {
          if (e === "unset") {
            store.unset();
            return;
          }
          store.update(e);
        }}
      >
        <SelectTrigger id="clipLSSelect" className="w-full">
          <SelectValue placeholder="Select CLIP-L" />
        </SelectTrigger>
        <SelectContent className="bg-background/80 p-1 backdrop-blur-xs">
          <SelectGroup>
            <SelectItem value="unset">unset</SelectItem>
            {data &&
              data.textEncoders.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

function ClipGSelect() {
  const store = useDiffusionConf("clipG");
  const rpc = useTRPC();
  const { data } = useQuery(rpc.info.models.queryOptions());

  return (
    <div className="space-y-2 pt-2">
      <Label htmlFor="clipGSelect">CLIP-G</Label>
      <Select
        value={store.value ?? ""}
        onValueChange={(e) => {
          if (e === "unset") {
            store.unset();
            return;
          }
          store.update(e);
        }}
      >
        <SelectTrigger id="clipGSelect" className="w-full">
          <SelectValue placeholder="Select CLIP-G" />
        </SelectTrigger>
        <SelectContent className="bg-background/80 p-1 backdrop-blur-xs">
          <SelectGroup>
            <SelectItem value="unset">unset</SelectItem>
            {data &&
              data.textEncoders.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

function T5xxlSelect() {
  const store = useDiffusionConf("t5xxl");
  const rpc = useTRPC();
  const { data } = useQuery(rpc.info.models.queryOptions());

  return (
    <div className="space-y-2 pt-2">
      <Label htmlFor="t5xxlSelect">T5 XXL</Label>
      <Select
        value={store.value ?? ""}
        onValueChange={(e) => {
          if (e === "unset") {
            store.unset();
            return;
          }
          store.update(e);
        }}
      >
        <SelectTrigger id="t5xxlSelect" className="w-full">
          <SelectValue placeholder="Select T5 XXL" />
        </SelectTrigger>
        <SelectContent className="bg-background/80 p-1 backdrop-blur-xs">
          <SelectGroup>
            <SelectItem value="unset">unset</SelectItem>
            {data &&
              data.textEncoders.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

function LlmSelect() {
  const store = useDiffusionConf("llm");
  const rpc = useTRPC();
  const { data } = useQuery(rpc.info.models.queryOptions());

  return (
    <div className="space-y-2 pt-2">
      <Label htmlFor="llmSelect">LLM</Label>
      <Select
        value={store.value ?? ""}
        onValueChange={(e) => {
          if (e === "unset") {
            store.unset();
            return;
          }
          store.update(e);
        }}
      >
        <SelectTrigger id="llmSelect" className="w-full">
          <SelectValue placeholder="Select LLM" />
        </SelectTrigger>
        <SelectContent className="bg-background/80 p-1 backdrop-blur-xs">
          <SelectGroup>
            <SelectItem value="unset">unset</SelectItem>
            {data &&
              data.llms.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

function QuantizationTypeSelect() {
  const store = useDiffusionConf("quantizationType");
  return (
    <div className="space-y-2 pt-2">
      <Label htmlFor="quantizationTypeSelect">In-place Quantization</Label>
      <Select
        value={store.value ?? ""}
        onValueChange={(e) => {
          if (e === "unset") {
            store.unset();
            return;
          }
          const parsed = quantizationSchema.safeParse(e);
          if (parsed.success) {
            store.update(parsed.data);
          }
        }}
      >
        <SelectTrigger id="quantizationTypeSelect" className="w-full">
          <SelectValue placeholder="Select quantization type" />
        </SelectTrigger>
        <SelectContent className="bg-background/80 p-1 backdrop-blur-xs">
          <SelectGroup>
            <SelectItem value="unset">unset</SelectItem>
            {GGML_WEIGHTS_TYPE.map((it) => (
              <SelectItem key={it} value={it}>
                {it}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export function ModelSelector() {
  return (
    <div className="grid grid-cols-2 gap-2 px-4 md:grid-cols-3">
      <ModelSelect />
      <ModelTypeSelect />
      <VaeSelect />
      <ClipLSelect />
      <ClipGSelect />
      <T5xxlSelect />
      <LlmSelect />
      <QuantizationTypeSelect />
    </div>
  );
}
