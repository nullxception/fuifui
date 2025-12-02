import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
  ArrowLeft,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleAlertIcon,
  InfoIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useShallow } from "zustand/react/shallow";
import { parseDiffusionParams } from "../lib/metadataParser";
import ImageMetadata from "./ImageMetadata";
import { useGallery } from "./useGallery";

interface ImageLightboxProps {
  id: string;
}

export default function ImageLightbox({ id }: ImageLightboxProps) {
  const [, navigate] = useLocation();
  const {
    image: image,
    hasPrev,
    hasNext,
  } = useGallery(
    useShallow((state) => ({
      image: state.image,
      hasPrev: state.hasPrev,
      hasNext: state.hasNext,
    })),
  );
  const { getIdOf, removeImages, openImageById } = useGallery();

  useEffect(() => {
    openImageById(id);
  }, [openImageById, id]);

  const [shouldShowMetadata, showMetadata] = useState(() => {
    return window.innerWidth >= 1024; // lg breakpoint
  });

  const [shouldShowRemoveDialog, showRemoveDialog] = useState(false);

  const close = useCallback(() => {
    if (window.innerWidth < 1024) {
      showMetadata(false);
    }
    const stack = history.state?.stack || 1;
    history.go(0 - stack);
  }, []);

  const navigateImage = useCallback(
    (direction: "prev" | "next") => {
      const newId = getIdOf(direction);
      const stack = history.state?.stack || 1;
      navigate(`/${newId}`, {
        state: { stack: stack + 1 },
      });
    },
    [getIdOf, navigate],
  );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!image) return;

      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") navigateImage("next");
      if (e.key === "ArrowLeft") navigateImage("prev");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [image, navigateImage, close]);

  if (!image) return null;

  const parsedMetadata = parseDiffusionParams(image.metadata);

  const onRemove = () => {
    if (window.innerWidth < 1024) {
      showMetadata(false);
    }
    showRemoveDialog(false);
    close();
    removeImages([image.url]);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-100 flex items-center justify-center backdrop-blur-lg duration-200 fade-in"
        onClick={close}
      >
        <div
          className="flex h-full w-screen max-w-7xl flex-col overflow-hidden bg-background/50 shadow-2xl md:h-screen md:flex-row lg:w-[95vw] lg:rounded-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-background">
            <img
              src={image.url}
              alt="Full size"
              className="max-h-full max-w-full grow object-contain shadow-lg"
            />
            {hasPrev && (
              <div
                className={`absolute top-0 left-0 z-110 h-full w-1/3 cursor-pointer from-transparent to-background/35 select-none hover:-bg-linear-90`}
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage("prev");
                }}
              >
                <ChevronLeftIcon
                  className={`absolute top-1/2 left-4 z-110 h-8 w-8 -translate-y-1/2 rounded-full text-foreground/70`}
                />
              </div>
            )}
            {hasNext && (
              <div
                className={`absolute top-0 right-0 z-110 h-full w-1/3 cursor-pointer from-background/30 to-transparent select-none hover:-bg-linear-90`}
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage("next");
                }}
              >
                <ChevronRightIcon
                  className={`absolute top-1/2 right-4 z-110 h-8 w-8 -translate-y-1/2 text-foreground/70`}
                />
              </div>
            )}
            <Button
              variant="ghost"
              size="icon-lg"
              className="absolute right-5 bottom-5 z-110 h-12 rounded-full text-background/70 hover:bg-foreground/10 hover:text-foreground lg:hidden"
              onClick={(e) => {
                e.stopPropagation();
                showMetadata((v) => !v);
              }}
            >
              <InfoIcon className="text-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon-lg"
              className="absolute top-5 right-5 z-110 text-foreground/70 hover:bg-foreground/10 hover:text-foreground md:left-5"
              onClick={close}
            >
              <XIcon />
            </Button>
          </div>

          <ImageMetadata
            image={image}
            metadata={parsedMetadata}
            onRemove={() => showRemoveDialog(true)}
            showMetadata={showMetadata}
            className={`${shouldShowMetadata ? "block" : "hidden"} lg:block`}
          />
        </div>
      </div>
      {shouldShowRemoveDialog && (
        <>
          <div
            className="fixed top-0 left-0 z-199 h-screen w-full bg-background/60 backdrop-blur-md"
            onClick={() => showRemoveDialog(false)}
          />
          <Card className="fixed top-1/2 left-1/2 z-200 flex w-full max-w-80 -translate-1/2 flex-col justify-center overflow-clip shadow-background drop-shadow-lg">
            <CircleAlertIcon className="mt-5 h-10 w-10 self-center text-pink-500" />
            <p className="p-4 text-center">
              Are you sure you want to remove it ?
            </p>
            <div className="flex justify-center gap-2 bg-background/40 p-4">
              <Button
                variant="outline"
                className="w-1/2"
                onClick={() => showRemoveDialog(false)}
              >
                <ArrowLeft />
                Go back
              </Button>
              <Button
                variant="destructive"
                className="w-1/2"
                onClick={onRemove}
              >
                <Trash2Icon />
                Remove
              </Button>
            </div>
          </Card>
        </>
      )}
    </>
  );
}
