import type { SDImage } from "server/types";
import { create } from "zustand";

interface ImagePreloadStore {
  preloaded: Set<string>;
  preload: (image: string | SDImage | undefined) => void;
}

export const useImagePreload = create<ImagePreloadStore>((set, get) => ({
  preloaded: new Set<string>(),

  preload: (image: string | SDImage | undefined) => {
    const { preloaded } = get();
    const url = typeof image === "string" ? image : image?.url;

    if (typeof url === "undefined" || preloaded.has(url)) return;

    const img = new Image();
    img.src = url;

    set((state) => ({
      preloaded: new Set(state.preloaded).add(url),
    }));
  },
}));
