import { useEffect, useState } from "react";
import type { Image } from "../../utils/metadataParser";
import { parseDiffusionParams } from "../../utils/metadataParser";
import ImageMetadata from "./ImageMetadata";
import { Button } from "../ui/Button";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

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
          className="lg:hidden absolute right-5 bottom-5 z-110 text-black/70 hover:text-white hover:bg-white/10 h-12 rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            setShowMetadata((v) => !v);
          }}
        >
          <InformationCircleIcon className="w-8 h-8" />
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-5 right-5 md:left-5  z-110 text-white/70 hover:text-white hover:bg-white/10"
        onClick={onClose}
      >
        <XMarkIcon className="w-6 h-6" />
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
        <ChevronLeftIcon className="w-8 h-8" />
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
        <ChevronRightIcon className="w-8 h-8" />
      </Button>
    </div>
  );
}
