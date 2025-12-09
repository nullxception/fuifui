import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  outputTab: "image" | "console";
  showSettings: boolean;

  // Actions
  setOutputTab: (tab: "image" | "console") => void;
  setShowSettings: (show: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      outputTab: "image",
      showSettings: false,

      setOutputTab: (tab) => set({ outputTab: tab }),
      setShowSettings: (show) => set({ showSettings: show }),
    }),
    {
      name: "app-storage",
      partialize: (state) => ({
        outputTab: state.outputTab,
      }),
    },
  ),
);
