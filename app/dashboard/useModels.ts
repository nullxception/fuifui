import type { Models } from "server/types";
import { create } from "zustand";

interface ModelsState {
  models: Models;
  isLoading: boolean;
  error: string | null;

  setModels: (models: Models) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  fetchModels: () => Promise<void>;
}

export const useModels = create<ModelsState>((set) => ({
  models: {
    checkpoints: [],
    embeddings: [],
    loras: [],
    vaes: [],
  },
  isLoading: false,
  error: null,

  setModels: (models) => set({ models }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  fetchModels: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch("/api/models");
      if (!response.ok)
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      const models = await response.json();
      set({ models, isLoading: false });
    } catch (error) {
      console.error("Error fetching models:", error);
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
      });
    }
  },
}));
