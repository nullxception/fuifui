import { PhotoIcon } from "@heroicons/react/16/solid";
import type { Image } from "../../utils/metadataParser";
import { Footer } from "../Footer";

interface ImageGridProps {
  images: Image[];
  onImageClick: (image: Image) => void;
}

export default function ImageGrid({ images, onImageClick }: ImageGridProps) {
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
          <PhotoIcon className="w-12 h-12" />
        </div>
        <p className="text-lg font-medium text-white">No images yet</p>
        <p className="text-sm text-muted-foreground">
          Generated images will appear here
        </p>
        <Footer />
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-[repeat(2,1fr)] md:grid-cols-[repeat(3,1fr)] lg:grid-cols-[repeat(4,1fr)] [masonry-auto-flow:next]">
      {images.map((image, index) => (
        <div
          key={index}
          className="break-inside-avoid overflow-hidden rounded-xl bg-surface border border-border hover:border-primary/50 transition-colors cursor-pointer group"
          onClick={() => onImageClick(image)}
        >
          <img
            src={image.url}
            alt=""
            loading="lazy"
            className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ))}
      <Footer className="col-start-1 sm:col-end-3 md:col-end-4 lg:col-end-5" />
    </div>
  );
}
