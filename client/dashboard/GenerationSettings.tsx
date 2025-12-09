import { useQuery } from "@tanstack/react-query";
import { SliderInput } from "client/components/SliderInput";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "client/components/ui/input-group";
import { Label } from "client/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "client/components/ui/select";
import { Switch } from "client/components/ui/switch";
import { useTRPC } from "client/query";
import { useSettings } from "client/settings/useSettings";
import { DicesIcon, RotateCcwIcon } from "lucide-react";
import { defaultUserConfig } from "server/defaults";
import { useDiffusionConfig } from "./useDiffusionConfig";

export function GenerationSettings() {
  const store = useDiffusionConfig();
  const { settings } = useSettings();
  const defs = defaultUserConfig().settings;
  const rpc = useTRPC();
  const { data } = useQuery(rpc.sysInfo.queryOptions());

  const maxSliderWidth = settings.maxWidth || defs.maxWidth;
  const maxSliderHeight = settings.maxHeight || defs.maxHeight;

  const samplingMethods = [
    "euler",
    "euler_a",
    "heun",
    "dpm2",
    "dpm++2s_a",
    "dpm++2m",
    "dpm++2mv2",
    "ipndm",
    "ipndm_v",
    "lcm",
    "ddim_trailing",
    "tcd",
  ];

  const schedulers = [
    "discrete",
    "karras",
    "exponential",
    "ays",
    "gits",
    "smoothstep",
    "sgm_uniform",
    "simple",
  ];

  const rngOptions = ["std_default", "cuda", "cpu"];

  return (
    <div className="px-4">
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        <SliderInput
          label="Steps"
          valueDisplay={store.params.steps}
          min={1}
          max={100}
          value={store.params.steps ?? 20}
          onChange={(e) => store.update("steps", e)}
        />

        <SliderInput
          label="CFG Scale"
          valueDisplay={store.params.cfgScale}
          min={1}
          max={20}
          step={0.5}
          value={store.params.cfgScale ?? 7}
          onChange={(e) => store.update("cfgScale", e)}
        />

        <div className="space-y-4">
          <Label>Sampling Method</Label>
          <Select
            value={store.params.samplingMethod}
            onValueChange={(e) => {
              if (e === "unset") {
                store.unset("samplingMethod");
                return;
              }
              store.update("samplingMethod", e);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Sampling method`} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="unset">unset</SelectItem>
                {samplingMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <Label>Scheduler</Label>
          <Select
            value={store.params.scheduler}
            onValueChange={(e) => {
              if (e === "unset") {
                store.unset("scheduler");
                return;
              }
              store.update("scheduler", e);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Scheduler`} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="unset">unset</SelectItem>
                {schedulers.map((sched) => (
                  <SelectItem key={sched} value={sched}>
                    {sched}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <Label>RNG</Label>
          <Select
            value={store.params.rng}
            onValueChange={(e) => store.update("rng", e)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`RNG`} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {rngOptions.map((rng) => (
                  <SelectItem key={rng} value={rng}>
                    {rng}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <Label>Sampler RNG</Label>
          <Select
            value={store.params.samplerRng}
            onValueChange={(e) => store.update("samplerRng", e)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Sampler RNG`} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {rngOptions.map((rng) => (
                  <SelectItem key={rng} value={rng}>
                    {rng}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <SliderInput
          label="Width"
          valueDisplay={store.params.width}
          min={128}
          step={64}
          max={maxSliderWidth}
          value={store.params.width ?? 512}
          onChange={(e) => store.update("width", e)}
        />

        <SliderInput
          label="Height"
          valueDisplay={store.params.height}
          min={128}
          step={64}
          max={maxSliderHeight}
          value={store.params.height ?? 512}
          onChange={(e) => store.update("height", e)}
        />

        <SliderInput
          label={`CLIP Skip`}
          min={-1}
          max={2}
          step={1}
          value={store.params.clipSkip}
          onChange={(e) => store.update("clipSkip", e)}
        />

        {data && (
          <SliderInput
            label={`Threads ${store.params.threads < 1 ? ": Auto" : ""}`}
            min={0}
            max={data.cpuCount}
            value={store.params.threads}
            onChange={(e) => store.update("threads", e)}
          />
        )}

        <div className="flex gap-4">
          <Label>Seed</Label>
          <InputGroup>
            <InputGroupButton
              type="button"
              onClick={() =>
                store.update("seed", Math.floor(Math.random() * 9999999 + 1))
              }
              className="mr-2"
              title="Random Seed"
            >
              <DicesIcon />
            </InputGroupButton>
            <InputGroupInput
              type="number"
              value={store.params.seed}
              onChange={(e) => store.update("seed", parseInt(e.target.value))}
              placeholder="-1 for random"
            />
            <InputGroupButton
              type="button"
              onClick={() => store.update("seed", -1)}
              className="mr-2"
              title="Random Seed"
            >
              <RotateCcwIcon />
            </InputGroupButton>
          </InputGroup>
        </div>
        <div className="flex items-center justify-between py-2">
          <Label htmlFor="verbose" className="cursor-pointer">
            Verbose console output
          </Label>
          <Switch
            checked={store.params.verbose}
            onCheckedChange={(e) => store.update("verbose", e)}
          />
        </div>
        <div className="flex items-center justify-between py-2">
          <Label htmlFor="diffusionFa" className="cursor-pointer">
            Flash Attention
          </Label>
          <Switch
            checked={store.params.diffusionFa}
            onCheckedChange={(e) => store.update("diffusionFa", e)}
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <Label htmlFor="offloadToCpu" className="cursor-pointer">
            Offload weights to (CPU) RAM
          </Label>
          <Switch
            checked={store.params.offloadToCpu}
            onCheckedChange={(e) => store.update("offloadToCpu", e)}
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <Label htmlFor="forceSdxlVaeConvScale" className="cursor-pointer">
            Use SDXL VAE conv scale
          </Label>
          <Switch
            checked={store.params.forceSdxlVaeConvScale}
            onCheckedChange={(e) => store.update("forceSdxlVaeConvScale", e)}
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <Label htmlFor="diffusionConvDirect" className="cursor-pointer">
            Diffusion ggml_conv2d_direct
          </Label>
          <Switch
            checked={store.params.diffusionConvDirect}
            onCheckedChange={(e) => store.update("diffusionConvDirect", e)}
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <Label htmlFor="vaeConvDirect" className="cursor-pointer">
            VAE ggml_conv2d_direct
          </Label>
          <Switch
            checked={store.params.vaeConvDirect}
            onCheckedChange={(e) => store.update("vaeConvDirect", e)}
          />
        </div>
      </div>
    </div>
  );
}
