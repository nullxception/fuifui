import { SliderInput } from "@/components/customized/SliderInput";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useDiffusionConfig, useSettings } from "app/stores";
import { RotateCcwIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { defaultSettings } from "server/defaults";

export const GenerationSettings: React.FC = () => {
  const store = useDiffusionConfig();
  const { app } = useSettings();
  const [cpuCount, setCpuCount] = useState(16);

  const maxSliderWidth = app.maxWidth || defaultSettings.maxWidth;
  const maxSliderHeight = app.maxHeight || defaultSettings.maxHeight;

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

  useEffect(() => {
    const fetchCpuCount = async () => {
      try {
        const response = await fetch("/api/system-info");
        const data = await response.json();
        if (data.cpuCount) setCpuCount(data.cpuCount);
      } catch (error) {
        console.error("Failed to fetch CPU count:", error);
      }
    };
    fetchCpuCount();
  }, []);

  return (
    <div className="px-4">
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        <SliderInput
          label="Steps"
          valueDisplay={store.params.steps}
          min={1}
          max={100}
          value={store.params.steps}
          onChange={(e) => store.update("steps", e)}
        />

        <SliderInput
          label="CFG Scale"
          valueDisplay={store.params.cfgScale}
          min={1}
          max={20}
          step={0.5}
          value={store.params.cfgScale}
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

        <div className="space-y-4">
          <SliderInput
            label="Width"
            valueDisplay={store.params.width}
            min={128}
            step={64}
            max={maxSliderWidth}
            value={store.params.width}
            onChange={(e) => store.update("width", e)}
          />
        </div>

        <div className="space-y-4">
          <SliderInput
            label="Height"
            valueDisplay={store.params.height}
            min={128}
            step={64}
            max={maxSliderHeight}
            value={store.params.height}
            onChange={(e) => store.update("height", e)}
          />
        </div>

        <SliderInput
          label={`CLIP Skip`}
          min={-1}
          max={2}
          step={1}
          value={store.params.clipSkip}
          onChange={(e) => store.update("clipSkip", e)}
        />

        <div className="space-y-4">
          <Label>Seed</Label>
          <div className="flex gap-2">
            <InputGroup>
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
        </div>

        <SliderInput
          label={`Threads ${store.params.threads < 0 ? ": Auto" : ""}`}
          min={-1}
          max={cpuCount}
          value={store.params.threads}
          onChange={(e) => store.update("threads", e)}
        />

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
};
