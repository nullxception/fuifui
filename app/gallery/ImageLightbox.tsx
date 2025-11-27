import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import ImageMetadata from "./ImageMetadata";
import { parseDiffusionParams } from "./metadataParser";
import { useGalleryImages } from "./useGalleryImages";

export default function ImageLightbox() {
  const { selectedImage, closeLightbox, navigateImage, removeImages } =
    useGalleryImages();
  const [showMetadata, setShowMetadata] = useState(() => {
    return window.innerWidth >= 1024; // lg breakpoint
  });

  const [openRemoveDialog, setShowRemoveDialog] = useState(false);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;

      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") navigateImage("next");
      if (e.key === "ArrowLeft") navigateImage("prev");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, closeLightbox, navigateImage]);

  if (!selectedImage) return null;

  const parsedMetadata = parseDiffusionParams(selectedImage.metadata);

  const onRemove = () => {
    setShowRemoveDialog(false);
    closeLightbox();
    removeImages([selectedImage.url]);
  };

  return (
    <>
      <div
        className="animate-in fade-in fixed inset-0 z-100 flex items-center justify-center backdrop-blur-lg duration-200"
        onClick={closeLightbox}
      >
        <div
          className="flex h-screen w-screen max-w-7xl flex-col overflow-hidden rounded-xl border border-border bg-background/50 shadow-2xl md:flex-row lg:w-[95vw]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-black">
            <img
              src={selectedImage.url}
              alt="Full size"
              className="max-h-full max-w-full grow object-contain shadow-lg"
            />
            <div
              className={`absolute top-0 left-0 z-110 h-full w-1/6 cursor-pointer from-transparent to-black/50 select-none hover:-bg-linear-90`}
              onClick={(e) => {
                e.stopPropagation();
                navigateImage("prev");
              }}
            >
              <ChevronLeftIcon
                className={`absolute top-1/2 left-4 z-110 h-8 w-8 -translate-y-1/2 rounded-full text-white/70`}
              />
            </div>
            <div
              className={`absolute top-0 right-0 z-110 h-full w-1/6 cursor-pointer from-black/50 to-transparent select-none hover:-bg-linear-90`}
              onClick={(e) => {
                e.stopPropagation();
                navigateImage("next");
              }}
            >
              <ChevronRightIcon
                className={`absolute top-1/2 right-4 z-110 h-8 w-8 -translate-y-1/2 text-white/70`}
              />
            </div>
            <Button
              variant="ghost"
              className="absolute right-5 bottom-5 z-110 h-12 rounded-full text-black/70 hover:bg-white/10 hover:text-white lg:hidden"
              onClick={(e) => {
                e.stopPropagation();
                setShowMetadata((v) => !v);
              }}
            >
              <InformationCircleIcon className="h-6 w-6 text-white" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-5 right-5 z-110 text-white/70 hover:bg-white/10 hover:text-white md:left-5"
              onClick={closeLightbox}
            >
              <XMarkIcon className="h-6 w-6" />
            </Button>
          </div>

          <ImageMetadata
            image={selectedImage}
            parsedMetadata={parsedMetadata}
            onRemove={() => setShowRemoveDialog(true)}
            closeLightbox={closeLightbox}
            className={`${showMetadata ? "block" : "hidden"} lg:block`}
          />
        </div>
      </div>
      {openRemoveDialog ? (
        <>
          <div
            className="fixed top-0 left-0 z-199 h-screen w-full bg-black/60 backdrop-blur-md"
            onClick={() => setShowRemoveDialog(false)}
          />
          <Card className="fixed top-1/2 left-1/2 z-200 flex w-full max-w-3xs -translate-1/2 flex-col justify-center shadow-black drop-shadow-lg">
            <ExclamationTriangleIcon className="mt-5 h-10 w-10 self-center text-red-400" />
            <p className="p-4 text-center">Are you sure ?</p>
            <div className="flex justify-center gap-2 p-2">
              <Button
                variant="outline"
                className="w-1/2"
                onClick={() => setShowRemoveDialog(false)}
              >
                No
              </Button>
              <Button variant="danger" className="w-1/2" onClick={onRemove}>
                Remove
              </Button>
            </div>
          </Card>
        </>
      ) : (
        <></>
      )}
    </>
  );
}
