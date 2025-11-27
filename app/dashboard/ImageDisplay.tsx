import { PhotoIcon } from "@heroicons/react/24/outline";
import React from "react";

interface ImageDisplayProps {
  imageUrl: string | null;
  isProcessing: boolean;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({
  imageUrl,
  isProcessing,
}) => {
  return (
    <div className="flex h-[50vh] w-full flex-1 items-center justify-center bg-black/60 lg:h-full">
      {isProcessing ? (
        <div className="p-8 text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
          <p className="animate-pulse text-muted-foreground">
            Generating image...
          </p>
        </div>
      ) : imageUrl ? (
        <img
          src={imageUrl}
          alt="Generated output"
          className="h-full w-full object-contain"
        />
      ) : (
        <div className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-black text-white">
            <PhotoIcon className="h-12 w-12" />
          </div>
          <p className="mb-2 text-xl font-medium text-white">Ready to create</p>
          <p className="text-sm text-muted-foreground">
            Configure your settings and click Generate
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageDisplay;
