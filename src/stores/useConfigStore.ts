import { create } from "zustand";
import * as yaml from "js-yaml";

interface ConfigData {
  [key: string]: unknown;
}

interface ConfigState {
  config: ConfigData;
  isLoading: boolean;
  error: string | null;

  hasLoadedOnce: boolean;
  retryCount: number;

  loadConfig: () => Promise<void>;
  saveConfig: (cfg: ConfigData) => Promise<void>;
  setKey: <T>(key: string, value: T) => Promise<void>;
  getKey: <T>(key: string, fallback: T) => T;
}

const MAX_RETRIES = 3;

export const useConfigStore = create<ConfigState>((set, get) => ({
  config: {},
  isLoading: false,
  error: null,
  hasLoadedOnce: false,
  retryCount: 0,

  loadConfig: async () => {
    const state = get();
    if (state.isLoading || state.hasLoadedOnce) return;

    set({ isLoading: true, error: null });

    try {
      const response = await fetch("/api/config");

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const loaded = await response.json();
      const cur = get().config;

      const finalConfig =
        Object.keys(loaded).length === 0 && Object.keys(cur).length > 0
          ? cur
          : loaded;

      set({
        config: finalConfig,
        isLoading: false,
        error: null,
        hasLoadedOnce: true,
        retryCount: 0,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error loading config";

      set({
        isLoading: false,
        error: message,
      });

      const { retryCount } = get();
      if (
        retryCount < MAX_RETRIES &&
        (message.includes("fetch") || message.includes("non-JSON"))
      ) {
        const nextRetry = retryCount + 1;
        set({ retryCount: nextRetry });

        setTimeout(() => {
          get().loadConfig();
        }, 2000 * nextRetry);
      }
    }
  },

  saveConfig: async (cfg: ConfigData) => {
    const yamlBody = yaml.dump(cfg);

    const res = await fetch("/api/config/save", {
      method: "POST",
      headers: { "Content-Type": "application/yaml" },
      body: yamlBody,
    });

    if (!res.ok) {
      throw new Error(`Failed to save config: ${res.statusText}`);
    }

    set({ config: cfg });
  },

  setKey: async (key, value) => {
    const { config, hasLoadedOnce } = get();

    // update in memory immediately
    const updated = { ...config, [key]: value };
    set({ config: updated });

    // only save if config was loaded at least once
    if (hasLoadedOnce) {
      try {
        await get().saveConfig(updated);
      } catch (err) {
        console.warn("Error saving config", err);
      }
    }
  },

  getKey: (key, fallback) => {
    const cfg = get().config;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return cfg[key] !== undefined ? (cfg[key] as any) : fallback;
  },
}));
