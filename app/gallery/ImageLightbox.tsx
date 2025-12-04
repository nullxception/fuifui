import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleAlertIcon,
  InfoIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useShallow } from "zustand/react/shallow";
import ImageMetadata from "./ImageMetadata";
import { useGallery } from "./useGallery";

const RemoveImage = ({
  onCancel,
  onRemove,
}: {
  onCancel: () => void;
  onRemove: () => void;
}) => {
  return (
    <>
      <div
        className="fixed top-0 left-0 z-199 h-screen w-full bg-background/60 backdrop-blur-md"
        onClick={onCancel}
      />
      <Card className="fixed top-1/2 left-1/2 z-200 flex w-full max-w-80 -translate-1/2 flex-col justify-center overflow-clip shadow-background drop-shadow-lg">
        <CircleAlertIcon className="mt-5 h-10 w-10 self-center text-pink-500" />
        <p className="p-4 text-center">Are you sure you want to remove it ?</p>
        <div className="flex justify-center gap-2 bg-background/40 p-4">
          <Button variant="outline" className="w-1/2" onClick={onCancel}>
            <ArrowLeftIcon />
            Go back
          </Button>
          <Button variant="destructive" className="w-1/2" onClick={onRemove}>
            <Trash2Icon />
            Remove
          </Button>
        </div>
      </Card>
    </>
  );
};

interface PageDirection {
  index: number;
  direction: "next" | "prev";
}

const variants = {
  enter: (page: PageDirection) => ({
    x: page.direction === "next" ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (page: PageDirection) => ({
    zIndex: 0,
    x: page.direction === "prev" ? "100%" : "-100%",
    opacity: 0,
  }),
};

export default function ImageLightbox() {
  const [page, setPage] = useState<PageDirection>({
    index: 0,
    direction: "next",
  });
  const [, navigate] = useLocation();
  const [, params] = useRoute("/gallery/:id");
  const id = params ? params.id : "";
  const { images } = useGallery(
    useShallow((state) => ({ images: state.images })),
  );
  const { removeImages, fetchImages } = useGallery();
  const [shouldShowRemoveDialog, showRemoveDialog] = useState(false);
  const [shouldShowMetadata, showMetadata] = useState(() => {
    return window.innerWidth >= 1024; // lg breakpoint
  });

  const index = images.findLastIndex((i) => i.name === id);

  const getAdjacentImages = useCallback(() => {
    if (images.length === 0) return { prevImage: null, nextImage: null };
    const prevImage = index > 0 ? images[index - 1] : null;
    const nextImage = index < images.length - 1 ? images[index + 1] : null;
    return { prevImage, nextImage };
  }, [index, images]);

  const image = images[index];
  const { prevImage, nextImage } = getAdjacentImages();

  const close = useCallback(() => {
    if (window.innerWidth < 1024) {
      showMetadata(false);
    }
    navigate(history.state?.from || "~/gallery", { replace: true });
  }, [navigate]);

  const hasNext = index + 1 < images.length;
  const hasPrev = index != 0;

  const goto = useCallback(
    (dest: "prev" | "next") => {
      if ((dest === "next" && !hasNext) || (dest === "prev" && !hasPrev)) {
        return;
      }
      let newIndex;
      if (dest === "next") {
        newIndex = (index + 1) % images.length;
        // preload more
        fetchImages(true);
      } else {
        newIndex = (index - 1 + images.length) % images.length;
      }

      const newId = images[newIndex]?.name;
      setPage({
        index: page.index + (dest === "next" ? 1 : -1),
        direction: dest,
      });
      navigate(`~/gallery/${newId}`, {
        state: { from: history.state?.from || "~/gallery" },
      });
    },
    [fetchImages, hasNext, hasPrev, index, images, navigate, page.index],
  );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!image) return;

      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") goto("next");
      if (e.key === "ArrowLeft") goto("prev");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [image, goto, close]);

  const onRemove = () => {
    if (image) {
      removeImages([image.url]);
    }
    if (window.innerWidth < 1024) {
      showMetadata(false);
    }
    showRemoveDialog(false);
    goto(hasPrev ? "prev" : "next");
  };

  return (
    <>
      <div className="lightbox fixed inset-0 z-100 flex h-full w-screen flex-col overflow-hidden bg-background/50 shadow-2xl backdrop-blur-lg md:h-screen md:flex-row">
        <div className="relative flex flex-1 items-center justify-center overflow-hidden">
          <AnimatePresence initial={false} custom={page}>
            <motion.div
              key={id}
              custom={page}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "tween", duration: 0.3, ease: "easeOut" },
                opacity: { duration: 0.15 },
              }}
              drag="x"
              dragConstraints={{
                left: hasNext ? undefined : 0,
                right: hasPrev ? undefined : 0,
              }}
              dragElastic={0.2}
              onDragEnd={(e, { offset, velocity }) => {
                const swipeThreshold = 50;
                const swipePower = Math.abs(offset.x) * velocity.x;

                if (swipePower < -swipeThreshold || offset.x < -100) {
                  goto("next");
                } else if (swipePower > swipeThreshold || offset.x > 100) {
                  goto("prev");
                }
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {prevImage && (
                <img
                  src={`${prevImage.url}`}
                  alt="previous"
                  className="absolute right-full mr-4 h-full w-full object-contain opacity-50 select-none"
                  style={{ pointerEvents: "none" }}
                />
              )}

              {image && (
                <img
                  src={`${image.url}`}
                  alt="preview"
                  className="h-full w-full object-contain"
                  style={{ pointerEvents: "none" }}
                />
              )}

              {nextImage && (
                <img
                  src={`${nextImage.url}`}
                  alt="next"
                  className="absolute left-full ml-4 h-full w-full object-contain opacity-50 select-none"
                  style={{ pointerEvents: "none" }}
                />
              )}
            </motion.div>
          </AnimatePresence>
          <div
            className={`absolute top-1/2 left-0 z-110 flex h-full w-15 -translate-y-1/2 cursor-pointer items-center justify-center from-transparent to-background/35 select-none hover:-bg-linear-90`}
            onClick={(e) => {
              e.stopPropagation();
              goto("prev");
            }}
          >
            {hasPrev && (
              <ChevronLeftIcon className={`h-8 w-8 text-foreground/70`} />
            )}
          </div>
          <div
            className={`absolute top-1/2 right-0 z-110 flex h-full w-15 -translate-y-1/2 cursor-pointer items-center justify-center from-background/35 to-transparent select-none hover:-bg-linear-90`}
            onClick={(e) => {
              e.stopPropagation();
              goto("next");
            }}
          >
            {hasNext && (
              <ChevronRightIcon className={`h-8 w-8 text-foreground/70`} />
            )}
          </div>
          {!shouldShowMetadata && (
            <Button
              variant="ghost"
              size="icon-lg"
              className="absolute right-5 bottom-5 z-110 h-12 rounded-full text-background/70 hover:bg-foreground/10 hover:text-foreground lg:hidden"
              onClick={(e) => {
                e.stopPropagation();
                showMetadata(true);
              }}
            >
              <InfoIcon className="text-foreground" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-lg"
            className="absolute top-5 left-5 z-110 text-foreground/70 hover:bg-foreground/10 hover:text-foreground"
            onClick={close}
          >
            <XIcon />
          </Button>
        </div>

        {image && (
          <ImageMetadata
            image={image}
            onRemove={() => showRemoveDialog(true)}
            showMetadata={showMetadata}
            className={`${shouldShowMetadata ? "block" : "hidden"}`}
          />
        )}
      </div>
      {shouldShowRemoveDialog && (
        <RemoveImage
          onRemove={onRemove}
          onCancel={() => showRemoveDialog(false)}
        />
      )}
    </>
  );
}
