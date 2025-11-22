import { useEffect, useState } from "react";
import type { Image } from "../../utils/metadataParser";
import { parseDiffusionParams } from "../../utils/metadataParser";
import ImageMetadata from "./ImageMetadata";
import { Button } from "../ui/Button";

interface ImageLightboxProps {
  selectedImage: Image | null;
  onClose: () => void;
  onNavigate: (direction: "next" | "prev") => void;
}

export default function ImageLightbox({
  selectedImage,
  onClose,
  onNavigate,
}: ImageLightboxProps) {
  const [showMetadata, setShowMetadata] = useState(() => {
    return window.innerWidth >= 1024; // lg breakpoint
  });

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;

      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate("next");
      if (e.key === "ArrowLeft") onNavigate("prev");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, onClose, onNavigate]);

  if (!selectedImage) return null;

  const parsedMetadata = parseDiffusionParams(selectedImage.metadata);

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center backdrop-blur-lg animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="flex flex-col md:flex-row h-screen w-screen lg:w-[95vw] max-w-7xl bg-background/50 rounded-xl overflow-hidden shadow-2xl border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 flex items-center justify-center bg-black overflow-hidden">
          <img
            src={selectedImage.url}
            alt="Full size"
            className="max-h-full grow max-w-full object-contain shadow-lg"
          />
        </div>

        <ImageMetadata
          image={selectedImage}
          parsedMetadata={parsedMetadata}
          className={`${showMetadata ? "block" : "hidden"} lg:block`}
        />
        <Button
          variant="ghost"
          className="lg:hidden absolute right-5 bottom-5 -translate-y-1/2 z-110 text-black/70 hover:text-white hover:bg-white/10 h-12 rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            setShowMetadata((v) => !v);
          }}
        >
          {showMetadata ? "Hide Details" : "Show Details"}
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-5 right-5 md:left-5  z-110 text-white/70 hover:text-white hover:bg-white/10"
        onClick={onClose}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={`absolute left-4 ${showMetadata ? "top-1/6" : "top-1/2"} md:top-1/2 -translate-y-1/2 z-110 text-white/70 hover:text-white hover:bg-white/10 h-12 w-12 rounded-full`}
        onClick={(e) => {
          e.stopPropagation();
          onNavigate("prev");
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={`absolute right-4 ${showMetadata ? "top-1/6" : "top-1/2"} md:top-1/2 -translate-y-1/2 z-110 text-white/70 hover:text-white hover:bg-white/10 h-12 w-12 rounded-full`}
        onClick={(e) => {
          e.stopPropagation();
          onNavigate("next");
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 4.5l7.5 7.5-7.5 7.5"
          />
        </svg>
      </Button>
    </div>
  );
}
