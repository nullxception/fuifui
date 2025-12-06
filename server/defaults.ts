import type { AppSettings, DiffusionParams } from "./types";

export function defaultDiffusionParams(): DiffusionParams {
  return {
    model: "",
    modelType: "full",
  };
}

export function defaultSettings(): AppSettings {
  return {
    maxWidth: 2048,
    maxHeight: 2048,
  };
}
