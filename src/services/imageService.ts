import type { Image } from "../utils/metadataParser";

export const imageService = {
  async fetchImages(): Promise<Image[]> {
    try {
      const response = await fetch("/api/images");
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
