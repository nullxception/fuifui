import type { Image } from "server/types";
import { create } from "zustand";

interface GalleryState {
  images: Image[];
  image: Image | null;
  isLoading: boolean;
  offset: number;
  hasMore: boolean;
  hasPrev: boolean;
  hasNext: boolean;

  openImageById: (imageId: string) => void;
  getIdOf: (direction: "next" | "prev") => string | undefined;
  fetchImages: (isLoadMore?: boolean) => Promise<void>;
  removeImages: (urls: string[]) => Promise<void>;
}

const LIMIT = 20;

export const useGallery = create<GalleryState>((set, get) => ({
  images: [],
  image: null,
  isLoading: false,
  offset: 0,
  hasMore: true,
  hasPrev: false,
  hasNext: true,

  openImageById: (imageId) => {
    const index = get().images.findLastIndex((i) => i.name === imageId);
    set({
      image: get().images[index],
      hasPrev: index > 0,
      hasNext: index < get().images.length - 1,
    });
  },
  getIdOf: (direction) => {
    const { images, image, hasPrev, hasNext, hasMore, fetchImages } = get();

    if (
      (direction === "next" && !hasNext) ||
      (direction === "prev" && !hasPrev)
    ) {
      return;
    }

    if (!image || images.length === 0) return;

    const currentIndex = images.indexOf(image);
    let newIndex;
    if (direction === "next") {
      newIndex = (currentIndex + 1) % images.length;
    } else {
      newIndex = (currentIndex - 1 + images.length) % images.length;
    }
    set({
      image: images[newIndex],
      hasPrev: newIndex > 0,
      hasNext: newIndex < images.length - 1,
    });
    // Pre-fetch more images if navigating next and at the end of the list
    if (direction === "next" && newIndex === images.length - 1 && hasMore) {
      fetchImages(true);
    }
    return images[newIndex]?.name;
  },
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
        const newImage =
          state.image && urls.includes(state.image.url) ? null : state.image;

        return {
          images: newImages,
          image: newImage,
          offset: Math.max(0, state.offset - urls.length),
        };
      });
    } catch (error) {
      console.error("Failed to remove image:", error);
    }
  },
}));
