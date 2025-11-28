import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useCallback, useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import ImageMetadata from "./ImageMetadata";
import { parseDiffusionParams } from "./metadataParser";
import { useGallery } from "./useGallery";

export default function ImageLightbox() {
  const { selectedImage, hasPrev, hasNext } = useGallery(
    useShallow((state) => ({
      selectedImage: state.selectedImage,
      hasPrev: state.hasPrev,
      hasNext: state.hasNext,
    })),
  );
  const { setSelectedImage, navigateImage, removeImages } = useGallery();

  const [shouldShowMetadata, showMetadata] = useState(() => {
    return window.innerWidth >= 1024; // lg breakpoint
  });

  const [shouldShowRemoveDialog, showRemoveDialog] = useState(false);

  const close = useCallback(() => {
    setSelectedImage(null);
  }, [setSelectedImage]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;

      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") navigateImage("next");
      if (e.key === "ArrowLeft") navigateImage("prev");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, setSelectedImage, navigateImage, close]);

  if (!selectedImage) return null;

  const parsedMetadata = parseDiffusionParams(selectedImage.metadata);

  const onRemove = () => {
    showRemoveDialog(false);
    close();
    removeImages([selectedImage.url]);
  };

  return (
    <>
      <div
        className="animate-in fade-in fixed inset-0 z-100 flex items-center justify-center backdrop-blur-lg duration-200"
        onClick={close}
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
            {hasPrev && (
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
            )}
            {hasNext && (
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
            )}
            <Button
              variant="ghost"
              className="absolute right-5 bottom-5 z-110 h-12 rounded-full text-black/70 hover:bg-white/10 hover:text-white lg:hidden"
              onClick={(e) => {
                e.stopPropagation();
                showMetadata((v) => !v);
              }}
            >
              <InformationCircleIcon className="h-6 w-6 text-white" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-5 right-5 z-110 text-white/70 hover:bg-white/10 hover:text-white md:left-5"
              onClick={close}
            >
              <XMarkIcon className="h-6 w-6" />
            </Button>
          </div>

          <ImageMetadata
            image={selectedImage}
            parsedMetadata={parsedMetadata}
            onRemove={() => showRemoveDialog(true)}
            closeLightbox={close}
            className={`${shouldShowMetadata ? "block" : "hidden"} lg:block`}
          />
        </div>
      </div>
      {shouldShowRemoveDialog && (
        <>
          <div
            className="fixed top-0 left-0 z-199 h-screen w-full bg-black/60 backdrop-blur-md"
            onClick={() => showRemoveDialog(false)}
          />
          <Card className="fixed top-1/2 left-1/2 z-200 flex w-full max-w-3xs -translate-1/2 flex-col justify-center shadow-black drop-shadow-lg">
            <ExclamationTriangleIcon className="mt-5 h-10 w-10 self-center text-red-400" />
            <p className="p-4 text-center">Are you sure ?</p>
            <div className="flex justify-center gap-2 p-2">
              <Button
                variant="outline"
                className="w-1/2"
                onClick={() => showRemoveDialog(false)}
              >
                No
              </Button>
              <Button variant="danger" className="w-1/2" onClick={onRemove}>
                Remove
              </Button>
            </div>
          </Card>
        </>
      )}
    </>
  );
}
