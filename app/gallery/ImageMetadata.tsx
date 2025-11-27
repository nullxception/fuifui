import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import type { Image } from "../../server/types";
import { useAppStore, useDiffusionConfig } from "../stores";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";
import type { ParsedMetadata } from "./metadataParser";

const saveImage = async (image: Image) => {
  try {
    const response = await fetch(image.url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = image.name;
    link.click();

    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Error downloading the image:", error);
  }
};

interface ImageMetadataProps {
  image: Image;
  parsedMetadata: ParsedMetadata | null;
  onRemove: () => void;
  closeLightbox: () => void;
  className: string;
}

export default function ImageMetadata({
  image,
  parsedMetadata,
  onRemove,
  closeLightbox,
  className = "",
}: ImageMetadataProps) {
  const { setActiveTab } = useAppStore();
  const store = useDiffusionConfig();

  const handleRemake = () => {
    if (!parsedMetadata) return;

    // Map parsed metadata to diffusion config parameters
    const { otherParams } = parsedMetadata;
    store.updateAll({
      prompt: parsedMetadata.prompt,
      negativePrompt: parsedMetadata.negativePrompt,
      steps: Number(otherParams.steps),
      cfgScale: Number(otherParams.cfgScale),
      width: Number(otherParams.width),
      height: Number(otherParams.height),
      samplingMethod: String(otherParams.samplingMethod),
      scheduler: String(otherParams.scheduler),
      model: String(otherParams.model),
    });

    // Navigate back to generate tab
    closeLightbox();
    setActiveTab("generate");
  };

  return (
    <>
      <div
        className={`scrollbar-thin flex h-[65vh] w-full flex-col gap-6 overflow-y-auto border-l border-border bg-surface/95 p-6 backdrop-blur-sm md:h-full md:w-[400px] ${className}`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Details</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs tracking-wider text-muted-foreground uppercase">
              Created
            </Label>
            <p className="font-mono text-sm text-white">
              {new Date(image.mtime).toLocaleString()}
            </p>
          </div>
          <div className="space-y-2 space-x-2">
            <Button onClick={onRemove} size="sm" variant="danger">
              <TrashIcon className="mr-2 h-4" /> Delete
            </Button>
            {parsedMetadata && (
              <Button onClick={handleRemake} size="sm" variant="primary">
                <ArrowPathIcon className="mr-2 h-4" /> Remake
              </Button>
            )}
            <Button
              onClick={() => saveImage(image)}
              size="sm"
              variant="secondary"
            >
              <ArrowDownTrayIcon className="mr-2 h-4" /> Download
            </Button>
          </div>
          {parsedMetadata ? (
            <div className="space-y-2">
              {parsedMetadata.prompt && (
                <div className="rounded border border-border/50 bg-black/20 p-2">
                  <Label className="mb-1 block text-[10px] tracking-wider text-pink-400 uppercase">
                    Prompt
                  </Label>
                  <p className="truncate font-mono text-xs whitespace-pre-wrap text-gray-200">
                    {parsedMetadata.prompt}
                  </p>
                </div>
              )}

              {parsedMetadata.negativePrompt && (
                <div className="rounded border border-border/50 bg-black/20 p-2">
                  <Label className="mb-1 block text-[10px] tracking-wider text-pink-400 uppercase">
                    Negative Prompt
                  </Label>
                  <p className="truncate font-mono text-xs whitespace-pre-wrap text-gray-200">
                    {parsedMetadata.negativePrompt}
                  </p>
                </div>
              )}

              {Object.keys(parsedMetadata.otherParams).length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(parsedMetadata.otherParams).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="rounded border border-border/50 bg-black/20 p-2"
                      >
                        <Label className="mb-1 block text-[10px] tracking-wider text-muted-foreground uppercase">
                          {key}
                        </Label>
                        <p className="font-mono text-xs wrap-break-word text-gray-200">
                          {value}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          ) : // Fallback to raw metadata if parsing fails or no string found
          image.metadata && Object.keys(image.metadata).length > 0 ? (
            Object.entries(image.metadata).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <Label className="text-xs tracking-wider text-muted-foreground uppercase">
                  {key}
                </Label>
                <div className="rounded border border-border/50 bg-black/20 p-2 font-mono text-sm wrap-break-word whitespace-pre-wrap text-gray-300">
                  {typeof value === "object"
                    ? JSON.stringify(value, null, 2)
                    : String(value)}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No metadata found.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
