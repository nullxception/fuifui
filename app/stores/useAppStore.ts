import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  activeTab: "generate" | "gallery";
  outputTab: "image" | "console";
  showSettings: boolean;
  jobId: string;
  isProcessing: boolean;

  // Actions
  setActiveTab: (tab: "generate" | "gallery") => void;
  setOutputTab: (tab: "image" | "console") => void;
  setShowSettings: (show: boolean) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setJobId: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeTab: "generate",
      outputTab: "image",
      showSettings: false,
      jobId: "",
      isProcessing: false,

      setActiveTab: (tab) => set({ activeTab: tab }),
      setOutputTab: (tab) => set({ outputTab: tab }),
      setShowSettings: (show) => set({ showSettings: show }),
      setIsProcessing: (loading) => set({ isProcessing: loading }),
      setJobId: (id) => set({ jobId: id }),
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
