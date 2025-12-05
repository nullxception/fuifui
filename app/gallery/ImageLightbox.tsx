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
import { useCallback, useEffect, useRef, useState } from "react";
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
  const { image, hasNext, hasPrev } = useGallery(
    useShallow((state) => ({
      image: state.image,
      hasNext: state.hasNext,
      hasPrev: state.hasPrev,
    })),
  );
  const { removeImages, setImage, findNewId } = useGallery();
  const [shouldShowRemoveDialog, showRemoveDialog] = useState(false);
  const isMd = window.innerWidth < 768;
  const [shouldShowMetadata, showMetadata] = useState(!isMd);
  const id = params?.id;

  useEffect(() => {
    if (id && id !== "") setImage(id);
  }, [id, setImage]);

  const close = useCallback(() => {
    setTimeout(() => {
      if (isMd) {
        showMetadata(false);
      }
    }, 300);
    navigate(history.state?.from || "~/gallery", { replace: true });
  }, [isMd, navigate]);

  const goto = useCallback(
    (dest: "prev" | "next") => {
      if ((dest === "next" && !hasNext) || (dest === "prev" && !hasPrev)) {
        return;
      }
      setPage({
        index: page.index + (dest === "next" ? 1 : -1),
        direction: dest,
      });
      navigate(`~/gallery/${findNewId(dest)}`, {
        state: { from: history.state?.from || "~/gallery" },
      });
    },
    [hasNext, hasPrev, findNewId, page.index, navigate],
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
    showRemoveDialog(false);
    setTimeout(() => {
      if (isMd) {
        showMetadata(false);
      }
    }, 300);
    if (hasPrev) {
      goto("prev");
    } else {
      close();
    }
  };

  // prevent scroll on preview canvas
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: { deltaY: number; preventDefault: () => void }) => {
      e.preventDefault();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <>
      <motion.div
        className="fixed inset-0 z-100 flex h-full w-screen flex-col overflow-hidden bg-background/50 shadow-2xl backdrop-blur-lg md:h-screen md:flex-row"
        transition={{ duration: 0.3 }}
        initial={{ opacity: 0, scale: 1.25 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.25 }}
      >
        <div
          className="relative flex flex-1 items-stretch justify-center overflow-hidden"
          ref={ref}
        >
          <AnimatePresence initial={false} custom={page}>
            <motion.img
              key={image?.name}
              className="absolute h-full w-full object-contain"
              src={image?.url}
              alt="preview"
              custom={page}
              variants={variants}
              inherit={false}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "tween", duration: 0.3, ease: "circOut" },
                opacity: { duration: 0.3 },
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
            />
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
            className="absolute bottom-5 left-5 z-110 text-foreground/70 hover:bg-foreground/10 hover:text-foreground md:top-5"
            onClick={close}
          >
            <XIcon />
          </Button>
        </div>

        {image && (
          <ImageMetadata
            image={image}
            onRemove={() => showRemoveDialog(true)}
            onClose={() => showMetadata(false)}
            className={`${shouldShowMetadata ? "block" : "hidden"}`}
          />
        )}
      </motion.div>
      {shouldShowRemoveDialog && (
        <RemoveImage
          onRemove={onRemove}
          onCancel={() => showRemoveDialog(false)}
        />
      )}
    </>
  );
}
