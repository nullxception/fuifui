import useYamlConf from "../hooks/useYamlConf";
import type { DiffusionParams } from "../../server/types";

// Create a hook that combines Zustand store with YAML persistence
export const useDiffusionConfigStore = () => {
  // Use the existing YAML config hooks

  const [diffusion, setDiffusion] = useYamlConf<DiffusionParams>("diffusion", {
    model: "",
    vae: "",
    prompt: "",
    negativePrompt: "",
    steps: 20,
    cfgScale: 7.0,
    seed: -1,
    width: 512,
    height: 768,
    flashAttention: false,
    samplingMethod: "euler_a",
    scheduler: "karras",
    rng: "std_default",
    samplerRng: "",
    diffusionConvDirect: false,
    vaeConvDirect: false,
    threads: -1,
    offloadToCpu: false,
    forceSdxlVaeConvScale: false,
  });

  return {
    // Current values
    params: diffusion,

    // Actions
    update: (
      key: keyof DiffusionParams,
      value: DiffusionParams[keyof DiffusionParams],
    ) => {
      setDiffusion((prev) => ({ ...prev, [key]: value }));
    },
    updateAll: (partial: Partial<DiffusionParams>) => {
      setDiffusion((prev) => ({ ...prev, ...partial }));
    },
  };
};
