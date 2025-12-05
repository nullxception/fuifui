import type { Image } from "server/types";
import { create } from "zustand";

interface GalleryState {
  images: Image[];
  isLoading: boolean;
  offset: number;
  hasMore: boolean;
  lastLoadedImage?: Image;

  fetchImages: (isLoadMore?: boolean) => Promise<void>;
  removeImages: (urls: string[]) => Promise<void>;
  setLastLoadedImage: (image: Image) => void;
}

const LIMIT = 20;

export const useGallery = create<GalleryState>((set, get) => ({
  lastLoadedImage: undefined,
  images: [],
  isLoading: false,
  offset: 0,
  hasMore: true,

  fetchImages: async (isLoadMore = false) => {
    const { isLoading, offset } = get();
    if (isLoading) return;

    try {
      const currentOffset = isLoadMore ? offset : 0;
      set({ isLoading: true });
      const response = await fetch(
        `/api/images?limit=${LIMIT}&offset=${currentOffset}`,
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch images: ${response.statusText}`);
      }
      const newImages: Image[] = await response.json();

      set((state) => ({
        images: isLoadMore ? [...state.images, ...newImages] : newImages,
        offset: isLoadMore ? state.offset + LIMIT : LIMIT,
        hasMore: newImages.length >= LIMIT,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error fetching images:", error);
      set({ isLoading: false });
    }
  },
  removeImages: async (urls: string[]) => {
    try {
      await fetch("/api/images", {
        method: "DELETE",
        body: JSON.stringify(urls),
      });

      set((state) => {
        const newImages = state.images.filter((img) => !urls.includes(img.url));

        return {
          images: newImages,
          offset: Math.max(0, state.offset - urls.length),
        };
      });
    } catch (error) {
      console.error("Failed to remove image:", error);
    }
  },
  setLastLoadedImage: (image: Image) => {
    set({ lastLoadedImage: image });
  },
}));
