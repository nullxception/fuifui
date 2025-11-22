import useYamlConf from "../hooks/useYamlConf";

// This store will wrap the useYamlConf hook for diffusion parameters
// We'll use a pattern where the store manages the state but persists via YAML

interface DiffusionConfigState {
  // Diffusion parameters (these will be synced with YAML config)
  model: string;
  vae: string;
  prompt: string;
  negativePrompt: string;
  steps: number;
  cfgScale: number;
  seed: number;
  width: number;
  height: number;
  flashAttention: boolean;
  samplingMethod: string;
  scheduler: string;
  rng: string;
  samplerRng: string;
  diffusionConvDirect: boolean;
  vaeConvDirect: boolean;
  threads: number;
  offloadToCpu: boolean;

  // Actions that update both store and YAML
  updateModel: (model: string) => void;
  updatePrompt: (prompt: string) => void;
  updateNegativePrompt: (negativePrompt: string) => void;
  updateSteps: (steps: number) => void;
  updateCfgScale: (cfgScale: number) => void;
  updateSeed: (seed: number) => void;
  updateWidth: (width: number) => void;
  updateHeight: (height: number) => void;
  updateDiffusionFa: (flashAttention: boolean) => void;
  updateSamplingMethod: (samplingMethod: string) => void;
  updateScheduler: (scheduler: string) => void;
  updateRng: (rng: string) => void;
  updateSamplerRng: (samplerRng: string) => void;
  updateDiffusionConvDirect: (diffusionConvDirect: boolean) => void;
  updateVaeConvDirect: (vaeConvDirect: boolean) => void;
  updateThreads: (threads: number) => void;
  updateOffloadToCpu: (offloadToCpu: boolean) => void;

  // Bulk update
  updateAll: (params: Partial<DiffusionConfigState>) => void;
}

// Create a hook that combines Zustand store with YAML persistence
export const useDiffusionConfigStore = () => {
  // Use the existing YAML config hooks
  const [model, setModel] = useYamlConf("model", "");
  const [vae, setVae] = useYamlConf("vae", "");
  const [prompt, setPrompt] = useYamlConf("prompt", "");
  const [negativePrompt, setNegativePrompt] = useYamlConf("negativePrompt", "");
  const [steps, setSteps] = useYamlConf("steps", 20);
  const [cfgScale, setCfgScale] = useYamlConf("cfgScale", 7.0);
  const [seed, setSeed] = useYamlConf("seed", -1);
  const [width, setWidth] = useYamlConf("width", 512);
  const [height, setHeight] = useYamlConf("height", 768);
  const [flashAttention, setDiffusionFa] = useYamlConf("flashAttention", false);
  const [samplingMethod, setSamplingMethod] = useYamlConf(
    "samplingMethod",
    "euler_a",
  );
  const [scheduler, setScheduler] = useYamlConf("scheduler", "karras");
  const [rng, setRng] = useYamlConf("rng", "std_default");
  const [samplerRng, setSamplerRng] = useYamlConf("samplerRng", "");
  const [diffusionConvDirect, setDiffusionConvDirect] = useYamlConf(
    "diffusionConvDirect",
    false,
  );
  const [vaeConvDirect, setVaeConvDirect] = useYamlConf("vaeConvDirect", false);
  const [threads, setThreads] = useYamlConf("threads", -1);
  const [offloadToCpu, setOffloadToCpu] = useYamlConf("offloadToCpu", false);

  return {
    // Current values
    model,
    vae,
    prompt,
    negativePrompt,
    steps,
    cfgScale,
    seed,
    width,
    height,
    flashAttention,
    samplingMethod,
    scheduler,
    rng,
    samplerRng,
    diffusionConvDirect,
    vaeConvDirect,
    threads,
    offloadToCpu,

    // Actions
    updateModel: setModel,
    updateVae: setVae,
    updatePrompt: setPrompt,
    updateNegativePrompt: setNegativePrompt,
    updateSteps: setSteps,
    updateCfgScale: setCfgScale,
    updateSeed: setSeed,
    updateWidth: setWidth,
    updateHeight: setHeight,
    updateDiffusionFa: setDiffusionFa,
    updateSamplingMethod: setSamplingMethod,
    updateScheduler: setScheduler,
    updateRng: setRng,
    updateSamplerRng: setSamplerRng,
    updateDiffusionConvDirect: setDiffusionConvDirect,
    updateVaeConvDirect: setVaeConvDirect,
    updateThreads: setThreads,
    updateOffloadToCpu: setOffloadToCpu,

    // Bulk update
    updateAll: (params: Partial<DiffusionConfigState>) => {
      if (params.model !== undefined) setModel(params.model);
      if (params.vae !== undefined) setModel(params.vae);
      if (params.prompt !== undefined) setPrompt(params.prompt);
      if (params.negativePrompt !== undefined)
        setNegativePrompt(params.negativePrompt);
      if (params.steps !== undefined) setSteps(params.steps);
      if (params.cfgScale !== undefined) setCfgScale(params.cfgScale);
      if (params.seed !== undefined) setSeed(params.seed);
      if (params.width !== undefined) setWidth(params.width);
      if (params.height !== undefined) setHeight(params.height);
      if (params.flashAttention !== undefined)
        setDiffusionFa(params.flashAttention);
      if (params.samplingMethod !== undefined)
        setSamplingMethod(params.samplingMethod);
      if (params.scheduler !== undefined) setScheduler(params.scheduler);
      if (params.rng !== undefined) setRng(params.rng);
      if (params.samplerRng !== undefined) setSamplerRng(params.samplerRng);
      if (params.diffusionConvDirect !== undefined)
        setDiffusionConvDirect(params.diffusionConvDirect);
      if (params.vaeConvDirect !== undefined)
        setVaeConvDirect(params.vaeConvDirect);
      if (params.threads !== undefined) setThreads(params.threads);
      if (params.offloadToCpu !== undefined)
        setOffloadToCpu(params.offloadToCpu);
    },
  };
};
