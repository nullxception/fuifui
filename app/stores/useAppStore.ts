import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  outputTab: "image" | "console";
  showSettings: boolean;
  jobId: string;
  isProcessing: boolean;

  // Actions
  setOutputTab: (tab: "image" | "console") => void;
  setShowSettings: (show: boolean) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setJobId: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      outputTab: "image",
      showSettings: false,
      jobId: "",
      isProcessing: false,

      setOutputTab: (tab) => set({ outputTab: tab }),
      setShowSettings: (show) => set({ showSettings: show }),
      setIsProcessing: (loading) => set({ isProcessing: loading }),
      setJobId: (id) => set({ jobId: id }),
    }),
    {
      name: "app-storage",
      partialize: (state) => ({
        outputTab: state.outputTab,
      }),
    },
  ),
);
