import { Thumbnail } from "@/components/Thumbnail";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { ArrowLeftIcon, CircleAlertIcon, Trash2Icon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";

import type { SDImage } from "server/types";

interface RemoveImagesDialogProps {
  onCancel: () => void;
  onRemove: () => Promise<unknown> | void;
  onRemoved: () => void;
  count?: number;
  images?: SDImage[];
}

export function RemoveImagesDialog({
  onCancel,
  onRemove,
  onRemoved,
  images = [],
}: RemoveImagesDialogProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const handleRemove = async () => {
    setIsRemoving(true);
    await onRemove();
    setIsRemoving(false);
    onRemoved();
  };

  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCancel();
      } else if (e.key === "ArrowLeft") {
        e.stopPropagation();
        cancelRef.current?.focus();
      } else if (e.key === "ArrowRight") {
        e.stopPropagation();
        confirmRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [onCancel]);

  useEffect(() => {
    confirmRef.current?.focus();
  }, []);

  return (
    <Card className="m-4 flex max-w-[90vh] flex-col justify-center overflow-clip shadow-background drop-shadow-lg">
      <CircleAlertIcon className="mt-2 h-8 w-8 self-center text-pink-500" />
      <p className="px-4 py-0 text-center">
        Are you sure you want to remove{" "}
        {images.length > 1 ? `${images.length} images` : "it"}?
      </p>
      <ResponsiveMasonry
        columnsCountBreakPoints={{
          350: images.length > 2 ? 3 : images.length,
        }}
        gutterBreakPoints={{ 350: "6px" }}
        className="max-h-[80vh] overflow-y-auto px-4 py-2 text-center"
      >
        <Masonry>
          {images.map((img) => (
            <Thumbnail image={img} key={img.name} className="rounded-xl" />
          ))}
        </Masonry>
      </ResponsiveMasonry>

      <CardFooter className="mt-2 flex w-full justify-center gap-2 bg-background/40 p-4">
        {!isRemoving && (
          <Button
            variant="outline"
            className="w-1/2"
            onClick={onCancel}
            ref={cancelRef}
          >
            <ArrowLeftIcon />
            Go back
          </Button>
        )}
        <Button
          variant="destructive"
          className={isRemoving ? "w-full" : "w-1/2"}
          onClick={handleRemove}
          disabled={isRemoving}
          ref={confirmRef}
        >
          <Trash2Icon />
          {isRemoving ? "Removing..." : "Remove"}
        </Button>
      </CardFooter>
    </Card>
  );
}
