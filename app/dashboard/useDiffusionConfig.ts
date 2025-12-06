import { defaultDiffusionParams } from "server/defaults";
import type { DiffusionParams } from "server/types";
import useConfig from "../stores/useConfig";

export function useDiffusionConfig() {
  const [diffusion, setDiffusion] = useConfig<DiffusionParams>(
    "diffusion",
    defaultDiffusionParams(),
  );

  return {
    params: diffusion,

    async update(
      key: keyof DiffusionParams,
      value: DiffusionParams[keyof DiffusionParams],
    ) {
      await setDiffusion((prev) => ({ ...prev, [key]: value }));
    },
    async unset(key: keyof DiffusionParams) {
      await setDiffusion((prev) => ({ ...prev, [key]: undefined }));
    },
    async updateAll(partial: Partial<DiffusionParams>) {
      await setDiffusion((prev) => ({ ...prev, ...partial }));
    },
  };
}
