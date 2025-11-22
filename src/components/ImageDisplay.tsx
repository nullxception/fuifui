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
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
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
