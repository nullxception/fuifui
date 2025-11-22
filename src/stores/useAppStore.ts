import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  // UI State
  activeTab: "generate" | "gallery";
  outputTab: "image" | "console";
  showSettings: boolean;
  isProcessing: boolean;

  // Actions
  setActiveTab: (tab: "generate" | "gallery") => void;
  setOutputTab: (tab: "image" | "console") => void;
  setShowSettings: (show: boolean) => void;
  setIsProcessing: (isProcessing: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      activeTab: "generate",
      outputTab: "image",
      showSettings: false,
      isProcessing: false,

      // Actions
      setActiveTab: (tab) => set({ activeTab: tab }),
      setOutputTab: (tab) => set({ outputTab: tab }),
      setShowSettings: (show) => set({ showSettings: show }),
      setIsProcessing: (loading) => set({ isProcessing: loading }),
    }),
    {
      name: "app-storage",
      partialize: (state) => ({
        activeTab: state.activeTab,
        outputTab: state.outputTab,
      }),
    },
  ),
);
