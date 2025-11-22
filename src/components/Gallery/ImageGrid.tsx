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
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
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
    <div className="grid gap-4 sm:grid-cols-[repeat(2,1fr)] md:grid-cols-[repeat(3,1fr)] lg:grid-cols-[repeat(4,1fr)] [masonry-auto-flow:next]">
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
