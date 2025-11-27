import { create } from "zustand";
import type { Image } from "../../server/types";

interface GalleryState {
  images: Image[];
  selectedImage: Image | null;
  isLoading: boolean;

  setImages: (images: Image[]) => void;
  appendImages: (images: Image[]) => void;
  setSelectedImage: (image: Image | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  addImage: (image: Image) => void;
  removeImage: (url: string) => void;
  navigateImage: (direction: "next" | "prev") => void;
}

export const useGallery = create<GalleryState>((set, get) => ({
  images: [],
  selectedImage: null,
  isLoading: false,

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
}));
