import { create } from "zustand";
import type { Image } from "../../server/types";

interface GalleryState {
  images: Image[];
  selectedImage: Image | null;
  isLoading: boolean;
  offset: number;
  hasMore: boolean;

  setImages: (images: Image[]) => void;
  appendImages: (images: Image[]) => void;
  setSelectedImage: (image: Image | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  addImage: (image: Image) => void;
  removeImage: (url: string) => void;
  navigateImage: (direction: "next" | "prev") => void;
  fetchImages: (isLoadMore?: boolean) => Promise<void>;
  removeImages: (urls: string[]) => Promise<void>;
}

const LIMIT = 20;

export const useGallery = create<GalleryState>((set, get) => ({
  images: [],
  selectedImage: null,
  isLoading: false,
  offset: 0,
  hasMore: true,

  setImages: (images) => set({ images }),
  appendImages: (newImages) =>
    set((state) => ({ images: [...state.images, ...newImages] })),
  setSelectedImage: (image) => set({ selectedImage: image }),
  setIsLoading: (isLoading) => set({ isLoading }),
  addImage: (image) => set((state) => ({ images: [image, ...state.images] })),
  removeImage: (url) =>
    set((state) => ({
      images: state.images.filter((img) => img.url !== url),
      selectedImage:
        state.selectedImage?.url === url ? null : state.selectedImage,
    })),
  navigateImage: (direction) => {
    const { images, selectedImage } = get();
    if (!selectedImage || images.length === 0) return;

    const currentIndex = images.indexOf(selectedImage);
    let newIndex;
    if (direction === "next") {
      newIndex = (currentIndex + 1) % images.length;
    } else {
      newIndex = (currentIndex - 1 + images.length) % images.length;
    }
    set({ selectedImage: images[newIndex] });
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
        const newSelectedImage =
          state.selectedImage && urls.includes(state.selectedImage.url)
            ? null
            : state.selectedImage;

        return {
          images: newImages,
          selectedImage: newSelectedImage,
          offset: Math.max(0, state.offset - urls.length),
        };
      });
    } catch (error) {
      console.error("Failed to remove image:", error);
    }
  },
}));
