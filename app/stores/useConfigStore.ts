import { defaultDiffusionParams, defaultSettings } from "server/defaults";
import type { UserConfig } from "server/types";
import { create } from "zustand";

interface ConfigState {
  config: UserConfig;
  isLoading: boolean;
  error: string | null;

  hasLoadedOnce: boolean;
  retryCount: number;

  loadConfig: () => Promise<void>;
  saveConfig: (cfg: UserConfig) => Promise<void>;
  setKey: <T>(key: keyof UserConfig, value: T) => Promise<void>;
  getKey: <T>(
    key: keyof UserConfig,
    fallback: T,
  ) => UserConfig[keyof UserConfig] | T;
}

const MAX_RETRIES = 3;

export const useConfigStore = create<ConfigState>((set, get) => ({
  config: {
    diffusion: defaultDiffusionParams,
    settings: defaultSettings,
    triggerWords: [],
  },
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

      const mergedConfig: UserConfig = {
        diffusion: {
          ...cur.diffusion,
          ...(finalConfig.diffusion || {}),
        },
        settings: {
          ...cur.settings,
          ...(finalConfig.settings || {}),
        },
        triggerWords: finalConfig.triggerWords || [],
      };

      set({
        config: mergedConfig,
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

  saveConfig: async (cfg: UserConfig) => {
    const res = await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cfg),
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
    return cfg[key] !== undefined
      ? (cfg[key] as UserConfig[keyof UserConfig])
      : fallback;
  },
}));
