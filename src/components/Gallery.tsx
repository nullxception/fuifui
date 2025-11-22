import { useGallery } from "../hooks/useGallery";
import ImageGrid from "./Gallery/ImageGrid";
import ImageLightbox from "./Gallery/ImageLightbox";

interface GalleryProps {
  isActive: boolean;
}

export default function Gallery({ isActive }: GalleryProps) {
  const { images, selectedImage, openLightbox, closeLightbox, navigateImage } =
    useGallery(isActive);

  if (!isActive) return null;

  return (
    <>
      <ImageGrid images={images} onImageClick={openLightbox} />
      <ImageLightbox
        selectedImage={selectedImage}
        onClose={closeLightbox}
        onNavigate={navigateImage}
      />
    </>
  );
}
