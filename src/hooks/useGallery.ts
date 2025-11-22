import { useEffect, useCallback } from "react";
import type { Image } from "../utils/metadataParser";
import { useGalleryStore } from "../stores/useGalleryStore";
import { imageService } from "../services/imageService";

export const useGallery = (isActive: boolean) => {
  const { images, selectedImage, setImages, setSelectedImage, navigateImage } =
    useGalleryStore();

  const fetchImages = useCallback(async () => {
    try {
      const images = await imageService.fetchImages();
      setImages(images);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  }, [setImages]);

  useEffect(() => {
    if (isActive) {
      const loadImages = async () => {
        await fetchImages();
      };
      loadImages();
    }
  }, [isActive, fetchImages]);

  const openLightbox = (image: Image) => {
    setSelectedImage(image);
  };

  const closeLightbox = useCallback(() => {
    setSelectedImage(null);
  }, [setSelectedImage]);

  return {
    images,
    selectedImage,
    openLightbox,
    closeLightbox,
    navigateImage,
  };
};
