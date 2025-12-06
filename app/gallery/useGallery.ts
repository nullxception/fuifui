import { useDiffusionJob } from "@/dashboard/useDiffusionJob";
import type { Image } from "server/types";
import { create } from "zustand";

interface GalleryState {
  image?: Image;
  index: number;
  images: Image[];
  offset: number;
  isLoading: boolean;
  hasMore: boolean;
  hasNext: boolean;
  hasPrev: boolean;

  fetchImages: (isLoadMore?: boolean) => Promise<void>;
  setImage: (name: string) => void;
  clearImage: () => void;
  findNewId: (dest: "next" | "prev") => string | undefined;
  removeImages: (urls: string[]) => Promise<void>;
  appendImage: (image: Image) => void;
}

const LIMIT = 20;

export const useGallery = create<GalleryState>((set, get) => ({
  image: undefined,
  index: 0,
  images: [],
  offset: 0,
  isLoading: false,
  hasMore: true,
  hasPrev: false,
  hasNext: false,

  findNewId(dest) {
    const { index, images, fetchImages } = get();
    let newIndex;
    if (dest === "next") {
      // preload more
      fetchImages(true);
      newIndex = (index + 1) % images.length;
    } else {
      newIndex = (index - 1 + images.length) % images.length;
    }

    return images[newIndex]?.name;
  },
  setImage(name) {
    const { images } = get();
    const index = images.findLastIndex((i) => i.name === name);

    set({
      image: images[index],
      index: index,
      hasNext: index + 1 < images.length,
      hasPrev: index != 0,
    });
  },
  clearImage() {
    set({
      image: undefined,
      index: 0,
      hasNext: false,
      hasPrev: false,
    });
  },
  appendImage(image) {
    set((state) => ({
      images: [image, ...state.images],
    }));
  },

  async fetchImages(isLoadMore = false) {
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
  async removeImages(urls: string[]) {
    try {
      await fetch("/api/images", {
        method: "DELETE",
        body: JSON.stringify(urls),
      });
      const { setImage, image } = useDiffusionJob.getState();
      if (image && urls.includes(image.url)) {
        setImage(undefined);
      }
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
}));
