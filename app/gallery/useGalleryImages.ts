import { useCallback, useEffect, useState } from "react";
import type { Image } from "../../server/types";
import { useGallery } from "./useGallery";

export const imageService = {
  async fetchImages(limit = 20, offset = 0): Promise<Image[]> {
    try {
      const response = await fetch(
        `/api/images?limit=${limit}&offset=${offset}`,
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch images: ${response.statusText}`);
      }
      const images = await response.json();
      return images;
    } catch (error) {
      console.error("Error fetching images:", error);
      throw error;
    }
  },
};

export const useGalleryImages = () => {
  const {
    images,
    selectedImage,
    setImages,
    appendImages,
    setSelectedImage,
    navigateImage,
    removeImage,
  } = useGallery();

  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const LIMIT = 20;

  const fetchImages = useCallback(
    async (isLoadMore = false) => {
      if (isLoadingMore && isLoadMore) return;

      try {
        if (isLoadMore) setIsLoadingMore(true);
        const currentOffset = isLoadMore ? offset : 0;

        const newImages = await imageService.fetchImages(LIMIT, currentOffset);

        if (newImages.length < LIMIT) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        if (isLoadMore) {
          appendImages(newImages);
          setOffset((prev) => prev + LIMIT);
        } else {
          setImages(newImages);
          setOffset(LIMIT);
        }
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        if (isLoadMore) setIsLoadingMore(false);
      }
    },
    [offset, isLoadingMore, setImages, appendImages],
  );

  useEffect(() => {
    fetchImages(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openLightbox = (image: Image) => {
    setSelectedImage(image);
  };

  const closeLightbox = useCallback(() => {
    setSelectedImage(null);
  }, [setSelectedImage]);

  const removeImages = async (urls: string[]) => {
    try {
      await fetch("/api/images", {
        method: "DELETE",
        body: JSON.stringify(urls),
      });
      urls.forEach((i) => removeImage(i));
      setOffset((prev) => Math.max(0, prev - urls.length));
    } catch (error) {
      console.error("Failed to remove image:", error);
    }
  };

  return {
    images,
    selectedImage,
    openLightbox,
    closeLightbox,
    navigateImage,
    removeImages,
    loadMore: () => fetchImages(true),
    hasMore,
    isLoadingMore,
  };
};
