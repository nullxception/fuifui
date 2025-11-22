import useYamlConf from "../hooks/useYamlConf";
import type { DiffusionParams } from "../../server/types";

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
  const [forceSdxlVaeConvScale, setForceSdxlVaeConvScale] = useYamlConf(
    "forceSdxlVaeConvScale",
    false,
  );

  return {
    // Current values
    params: {
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
      forceSdxlVaeConvScale,
    } as DiffusionParams,

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
    updateForceSdxlVaeConvScale: setForceSdxlVaeConvScale,

    // Bulk update
    updateAll: (params: Partial<DiffusionParams>) => {
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
      if (params.forceSdxlVaeConvScale !== undefined)
        setForceSdxlVaeConvScale(params.forceSdxlVaeConvScale);
    },
  };
};
