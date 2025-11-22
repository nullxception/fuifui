import React, { useEffect, useState } from "react";
import { useDiffusionConfigStore } from "../../stores";
import { Slider } from "../ui/Slider";
import { Select } from "../ui/Select";
import { Label } from "../ui/Label";
import { Input } from "../ui/Input";

export const GenerationSettings: React.FC = () => {
  const diffusionConfig = useDiffusionConfigStore();
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
      {/* Basic Settings */}

      <div className="p-4 space-y-4">
        <Slider
          label="Steps"
          valueDisplay={diffusionConfig.steps}
          min={1}
          max={100}
          value={diffusionConfig.steps}
          onChange={(e) =>
            diffusionConfig.updateSteps(parseInt(e.target.value))
          }
        />
        <Slider
          label="CFG Scale"
          valueDisplay={diffusionConfig.cfgScale}
          min={1}
          max={20}
          step={0.5}
          value={diffusionConfig.cfgScale}
          onChange={(e) =>
            diffusionConfig.updateCfgScale(parseFloat(e.target.value))
          }
        />
      </div>

      {/* Sampling & Scheduler */}
      <div className="px-4 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-4">
            <Label>Sampling Method</Label>
            <Select
              value={diffusionConfig.samplingMethod}
              onChange={(e) =>
                diffusionConfig.updateSamplingMethod(e.target.value)
              }
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
              value={diffusionConfig.scheduler}
              onChange={(e) => diffusionConfig.updateScheduler(e.target.value)}
            >
              {schedulers.map((sched) => (
                <option key={sched} value={sched}>
                  {sched}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <Label>RNG</Label>
            <Select
              value={diffusionConfig.rng}
              onChange={(e) => diffusionConfig.updateRng(e.target.value)}
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
              value={diffusionConfig.samplerRng}
              onChange={(e) => diffusionConfig.updateSamplerRng(e.target.value)}
            >
              <option value="">Use RNG</option>
              {rngOptions.map((rng) => (
                <option key={rng} value={rng}>
                  {rng}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Dimensions */}
      <div className="px-4 pt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <Label>Width</Label>
            <Input
              type="number"
              value={diffusionConfig.width}
              onChange={(e) =>
                diffusionConfig.updateWidth(parseInt(e.target.value))
              }
            />
          </div>
          <div className="space-y-4">
            <Label>Height</Label>
            <Input
              type="number"
              value={diffusionConfig.height}
              onChange={(e) =>
                diffusionConfig.updateHeight(parseInt(e.target.value))
              }
            />
          </div>
        </div>
      </div>

      {/* Advanced */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="flashAttention" className="cursor-pointer">
              Flash Attention
            </Label>
            <input
              type="checkbox"
              id="flashAttention"
              checked={diffusionConfig.flashAttention}
              onChange={(e) =>
                diffusionConfig.updateDiffusionFa(e.target.checked)
              }
              className="w-4 h-4 rounded border-gray-600 text-primary focus:ring-primary bg-black/50"
            />
          </div>

          <div className="space-y-2">
            <Label>Seed</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={diffusionConfig.seed}
                onChange={(e) =>
                  diffusionConfig.updateSeed(parseInt(e.target.value))
                }
                placeholder="-1 for random"
              />
              <button
                type="button"
                onClick={() => diffusionConfig.updateSeed(-1)}
                className="px-3 py-2 rounded-md text-white transition-colors"
                title="Random Seed"
              >
                🎲
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>
            Threads:{" "}
            {diffusionConfig.threads === -1 ? "Auto" : diffusionConfig.threads}
          </Label>
          <Slider
            min={-1}
            max={cpuCount}
            value={diffusionConfig.threads}
            onChange={(e) =>
              diffusionConfig.updateThreads(parseInt(e.target.value))
            }
          />
        </div>

        <div className="flex items-center justify-between py-2">
          <Label htmlFor="offloadToCpu" className="cursor-pointer">
            Offload Weights To CPU RAM
          </Label>
          <input
            type="checkbox"
            id="offloadToCpu"
            checked={diffusionConfig.offloadToCpu}
            onChange={(e) =>
              diffusionConfig.updateOffloadToCpu(e.target.checked)
            }
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
            checked={diffusionConfig.diffusionConvDirect}
            onChange={(e) =>
              diffusionConfig.updateDiffusionConvDirect(e.target.checked)
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
            checked={diffusionConfig.vaeConvDirect}
            onChange={(e) =>
              diffusionConfig.updateVaeConvDirect(e.target.checked)
            }
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
            checked={diffusionConfig.forceSdxlVaeConvScale}
            onChange={(e) =>
              diffusionConfig.updateForceSdxlVaeConvScale(e.target.checked)
            }
            className="w-4 h-4 rounded border-gray-600 text-primary focus:ring-primary bg-black/50"
          />
        </div>
      </div>
    </>
  );
};
