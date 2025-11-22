import { PhotoIcon } from "@heroicons/react/16/solid";
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
    <div className="flex-1 flex justify-center items-center h-[50vh] lg:h-full w-full bg-black/60">
      {isProcessing ? (
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground animate-pulse">
            Generating image...
          </p>
        </div>
      ) : imageUrl ? (
        <img
          src={imageUrl}
          alt="Generated output"
          className="max-w-full max-h-full object-contain shadow-2xl"
        />
      ) : (
        <div className="text-center p-8">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
            <PhotoIcon className="w-12 h-12" />
          </div>
          <p className="text-xl font-medium text-white mb-2">Ready to Create</p>
          <p className="text-sm text-muted-foreground">
            Configure your settings and click Generate
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageDisplay;
