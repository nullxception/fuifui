import React, { useEffect, useState } from "react";
import { useDiffusionConfigStore } from "../../stores";
import { Slider } from "../ui/Slider";
import { Select } from "../ui/Select";
import { Label } from "../ui/Label";
import { Input } from "../ui/Input";

export const GenerationSettings: React.FC = () => {
  const store = useDiffusionConfigStore();
  const [cpuCount, setCpuCount] = useState(16);

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
    <>
      <div className="p-4">
        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
          <Slider
            label="Steps"
            valueDisplay={store.params.steps}
            min={1}
            max={100}
            value={store.params.steps}
            onChange={(e) => store.update("steps", parseInt(e.target.value))}
          />

          <Slider
            label="CFG Scale"
            valueDisplay={store.params.cfgScale}
            min={1}
            max={20}
            step={0.5}
            value={store.params.cfgScale}
            onChange={(e) =>
              store.update("cfgScale", parseFloat(e.target.value))
            }
          />

          <div className="space-y-4">
            <Label>Sampling Method</Label>
            <Select
              value={store.params.samplingMethod}
              onChange={(e) => store.update("samplingMethod", e.target.value)}
            >
              {samplingMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Scheduler</Label>
            <Select
              value={store.params.scheduler}
              onChange={(e) => store.update("scheduler", e.target.value)}
            >
              {schedulers.map((sched) => (
                <option key={sched} value={sched}>
                  {sched}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-4">
            <Label>RNG</Label>
            <Select
              value={store.params.rng}
              onChange={(e) => store.update("rng", e.target.value)}
            >
              {rngOptions.map((rng) => (
                <option key={rng} value={rng}>
                  {rng}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Sampler RNG</Label>
            <Select
              value={store.params.samplerRng}
              onChange={(e) => store.update("samplerRng", e.target.value)}
            >
              <option value="">Use RNG</option>
              {rngOptions.map((rng) => (
                <option key={rng} value={rng}>
                  {rng}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Width</Label>
            <Input
              type="number"
              value={store.params.width}
              onChange={(e) => store.update("width", parseInt(e.target.value))}
            />
          </div>

          <div className="space-y-4">
            <Label>Height</Label>
            <Input
              type="number"
              value={store.params.height}
              onChange={(e) => store.update("height", parseInt(e.target.value))}
            />
          </div>

          <Slider
            label={`Threads ${store.params.threads < 0 ? ": Auto" : ""}`}
            min={-1}
            max={cpuCount}
            value={store.params.threads}
            onChange={(e) => store.update("threads", parseInt(e.target.value))}
          />

          <div className="space-y-4">
            <Label>Seed</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={store.params.seed}
                onChange={(e) => store.update("seed", parseInt(e.target.value))}
                placeholder="-1 for random"
              />
              <button
                type="button"
                onClick={() => store.update("seed", -1)}
                className="px-3 py-2 text-white transition-colors"
                title="Random Seed"
              >
                🎲
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <Label htmlFor="flashAttention" className="cursor-pointer">
              Flash Attention
            </Label>
            <input
              type="checkbox"
              id="flashAttention"
              checked={store.params.flashAttention}
              onChange={(e) => store.update("flashAttention", e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 text-primary focus:ring-primary bg-black/50"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <Label htmlFor="offloadToCpu" className="cursor-pointer">
              Offload Weights To CPU RAM
            </Label>
            <input
              type="checkbox"
              id="offloadToCpu"
              checked={store.params.offloadToCpu}
              onChange={(e) => store.update("offloadToCpu", e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 text-primary focus:ring-primary bg-black/50"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <Label htmlFor="diffusionConvDirect" className="cursor-pointer">
              diffusion ggml_conv2d_direct
            </Label>
            <input
              type="checkbox"
              id="diffusionConvDirect"
              checked={store.params.diffusionConvDirect}
              onChange={(e) =>
                store.update("diffusionConvDirect", e.target.checked)
              }
              className="w-4 h-4 rounded border-gray-600 text-primary focus:ring-primary bg-black/50"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <Label htmlFor="vaeConvDirect" className="cursor-pointer">
              vae ggml_conv2d_direct
            </Label>
            <input
              type="checkbox"
              id="vaeConvDirect"
              checked={store.params.vaeConvDirect}
              onChange={(e) => store.update("vaeConvDirect", e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 text-primary focus:ring-primary bg-black/50"
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <Label htmlFor="forceSdxlVaeConvScale" className="cursor-pointer">
              Use SDXL VAE conv scale
            </Label>
            <input
              type="checkbox"
              id="forceSdxlVaeConvScale"
              checked={store.params.forceSdxlVaeConvScale}
              onChange={(e) =>
                store.update("forceSdxlVaeConvScale", e.target.checked)
              }
              className="w-4 h-4 rounded border-gray-600 text-primary focus:ring-primary bg-black/50"
            />
          </div>
        </div>
      </div>
    </>
  );
};
