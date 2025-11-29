import { Footer } from "@/components/customized/Footer";
import { ImageIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Image } from "server/types";
import { useShallow } from "zustand/react/shallow";
import { useGallery } from "./useGallery";

function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry === undefined) return;
      setWidth(entry.contentRect.width);
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

interface GalleryItemProps {
  image: Image;
  onClick: () => void;
}

function GalleryItem({ image, onClick }: GalleryItemProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>();

  // derive appropriate thumbnail size based on real width
  const size = (() => {
    if (width < 192) return 192;
    if (width < 320) return 320;
    if (width < 480) return 480;
    return 512;
  })();

  return (
    <div
      ref={ref}
      className="group bg-surface relative cursor-pointer break-inside-avoid overflow-hidden rounded-xl border border-border transition-colors hover:border-primary/50"
      onClick={onClick}
    >
      {width > 1 ? (
        <img
          src={`${image.url}?size=${size}`}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <></>
      )}
    </div>
  );
}

export default function Gallery() {
  const { images, hasMore, isLoading } = useGallery(
    useShallow((state) => ({
      images: state.images,
      hasMore: state.hasMore,
      isLoading: state.isLoading,
    })),
  );
  const { fetchImages, setSelectedImage } = useGallery();
  const isLoadingMore = isLoading && images.length > 0;
  const observerTarget = useRef(null);

  useEffect(() => {
    fetchImages(false);
  }, [fetchImages]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting && hasMore && !isLoading) {
          fetchImages(true);
        }
      },
      { threshold: 0.1 },
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, fetchImages]);

  if (images.length === 0 && !isLoadingMore) {
    return (
      <>
        <div className="flex h-full flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-18 w-18 items-center justify-center rounded-full bg-background/50 p-2 text-foreground">
            <ImageIcon className="h-12 w-12" />
          </div>
          <p className="text-lg font-medium text-foreground">No images yet</p>
          <p className="text-sm text-muted-foreground">
            Generated images will appear here
          </p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto p-2 scrollbar-thumb-secondary scrollbar-track-transparent">
        <div className="grid grid-cols-[repeat(2,1fr)] gap-2 [masonry-auto-flow:next] md:grid-cols-[repeat(3,1fr)] lg:grid-cols-[repeat(4,1fr)]">
          {images.map((image, index) => (
            <GalleryItem
              key={index}
              onClick={() => setSelectedImage(image)}
              image={image}
            />
          ))}
          <div ref={observerTarget} className="col-span-full h-10 w-full" />
          {isLoadingMore && (
            <div className="col-span-full flex justify-center p-4">
              <span className="text-foreground">Loading more...</span>
            </div>
          )}
          <Footer className="col-start-1 sm:col-end-3 md:col-end-4 lg:col-end-5" />
        </div>
      </div>
    </>
  );
}
