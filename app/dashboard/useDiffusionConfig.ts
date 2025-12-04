import { defaultDiffusionParams } from "server/defaults";
import type { DiffusionParams } from "server/types";
import useConfig from "../stores/useConfig";

export const useDiffusionConfig = () => {
  const [diffusion, setDiffusion] = useConfig<DiffusionParams>(
    "diffusion",
    defaultDiffusionParams,
  );

  return {
    params: diffusion,

    update: (
      key: keyof DiffusionParams,
      value: DiffusionParams[keyof DiffusionParams],
    ) => {
      setDiffusion((prev) => ({ ...prev, [key]: value }));
    },
    unset: (key: keyof DiffusionParams) => {
      setDiffusion((prev) => ({ ...prev, [key]: undefined }));
    },
    updateAll: (partial: Partial<DiffusionParams>) => {
      setDiffusion((prev) => ({ ...prev, ...partial }));
    },
  };
};
