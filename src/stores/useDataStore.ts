import { create } from "zustand";

interface DataState {
  models: string[];
  vaes: string[];
  embeddings: string[];
  loras: string[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setModels: (models: string[]) => void;
  setVaes: (vaes: string[]) => void;
  setEmbeddings: (embeddings: string[]) => void;
  setLoras: (loras: string[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Async actions
  fetchModels: () => Promise<void>;
  fetchVaes: () => Promise<void>;
  fetchEmbeddings: () => Promise<void>;
  fetchLoras: () => Promise<void>;
}

export const useDataStore = create<DataState>((set) => ({
  // Initial state
  models: [],
  vaes: [],
  embeddings: [],
  loras: [],
  isLoading: false,
  error: null,

  // Actions
  setModels: (models) => set({ models }),
  setVaes: (vaes) => set({ vaes }),
  setEmbeddings: (embeddings) => set({ embeddings }),
  setLoras: (loras) => set({ loras }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Async actions
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

  // Async actions
  fetchVaes: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch("/api/vaes");
      if (!response.ok)
        throw new Error(`Failed to fetch vaes: ${response.statusText}`);
      const vaes = await response.json();
      set({ vaes, isLoading: false });
    } catch (error) {
      console.error("Error fetching vaes:", error);
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
      });
    }
  },

  fetchEmbeddings: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch("/api/embeddings");
      if (!response.ok)
        throw new Error(`Failed to fetch embeddings: ${response.statusText}`);
      const embeddings = await response.json();
      set({ embeddings, isLoading: false });
    } catch (error) {
      console.error("Error fetching embeddings:", error);
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
      });
    }
  },

  fetchLoras: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch("/api/loras");
      if (!response.ok)
        throw new Error(`Failed to fetch loras: ${response.statusText}`);
      const loras = await response.json();
      set({ loras, isLoading: false });
    } catch (error) {
      console.error("Error fetching loras:", error);
      set({
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
      });
    }
  },
}));
