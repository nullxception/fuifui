import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DownloadIcon, RefreshCcwIcon, TrashIcon } from "lucide-react";
import type { Image } from "server/types";
import { useLocation } from "wouter";
import type { ParsedMetadata } from "../lib/metadataParser";
import { useAppStore, useDiffusionConfig, useDiffusionStatus } from "../stores";

const saveImage = async (image: Image) => {
  try {
    const response = await fetch(image.url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const url = response.url;
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = url.substring(url.lastIndexOf("/") + 1);
    link.click();

    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Error downloading the image:", error);
  }
};

interface ImageMetadataProps {
  image: Image;
  metadata: ParsedMetadata | null;
  onRemove: () => void;
  showMetadata: (value: boolean) => void;
  className: string;
}

function MetadataChip({
  data: metadata,
  metakey,
  className = "",
}: {
  data: ParsedMetadata;
  metakey: keyof ParsedMetadata;
  className?: string;
}) {
  return (
    <div className="rounded border border-border/50 bg-background/50 p-2">
      <Label
        className={`mb-1 block text-[10px] tracking-wider text-gray-300 uppercase ${className}`}
      >
        {metakey.split(/(?=[A-Z])/).join(" ")}
      </Label>
      <p className="text-gray truncate font-mono text-xs whitespace-pre-wrap">
        {metadata[metakey].toString()}
      </p>
    </div>
  );
}

export default function ImageMetadata({
  image,
  metadata,
  onRemove,
  showMetadata,
  className = "",
}: ImageMetadataProps) {
  const [, navigate] = useLocation();
  const { setOutputTab } = useAppStore();
  const store = useDiffusionConfig();
  const { setImage } = useDiffusionStatus();

  const handleRemake = () => {
    if (!metadata) return;

    // Map parsed metadata to diffusion config parameters
    store.updateAll({
      prompt: metadata.prompt,
      negativePrompt: metadata.negativePrompt,
      steps: metadata.steps,
      cfgScale: metadata.cfgScale,
      width: metadata.baseWidth,
      height: metadata.baseHeight,
      samplingMethod: metadata.samplingMethod,
      scheduler: metadata.scheduler,
      model: metadata.model,
    });

    // Navigate back to generate tab
    showMetadata(false);
    setImage(image);
    setOutputTab("image");
    navigate("/");
  };

  return (
    <>
      <div
        className={`bg-surface/95 scrollbar-thin flex h-[65vh] w-full flex-col gap-6 overflow-y-auto border-l border-border p-6 backdrop-blur-sm scrollbar-thumb-secondary scrollbar-track-transparent md:h-full md:w-[400px] ${className}`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-foreground">Details</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs tracking-wider text-muted-foreground uppercase">
              Created
            </Label>
            <p className="font-mono text-sm text-foreground">
              {new Date(image.mtime).toLocaleString()}
            </p>
          </div>
          <div className="space-y-2 space-x-2">
            <Button onClick={onRemove} size="sm" variant="destructive">
              <TrashIcon /> Delete
            </Button>
            {metadata && (
              <Button onClick={handleRemake} size="sm" variant="default">
                <RefreshCcwIcon /> Remake
              </Button>
            )}
            <Button onClick={() => saveImage(image)} variant="outline">
              <DownloadIcon /> Download
            </Button>
          </div>
          {metadata ? (
            <div className="space-y-2">
              <MetadataChip
                data={metadata}
                metakey="prompt"
                className="text-blue-400"
              />
              <MetadataChip
                data={metadata}
                metakey="negativePrompt"
                className="text-pink-400"
              />
              <MetadataChip
                data={metadata}
                metakey="model"
                className="text-purple-400"
              />
              <div className="grid grid-cols-2 gap-3">
                <MetadataChip data={metadata} metakey="width" />
                <MetadataChip data={metadata} metakey="height" />
                <MetadataChip data={metadata} metakey="upscaled" />
                {metadata.upscaled && (
                  <MetadataChip data={metadata} metakey="baseWidth" />
                )}
                {metadata.upscaled && (
                  <MetadataChip data={metadata} metakey="baseHeight" />
                )}
                <MetadataChip data={metadata} metakey="steps" />
                <MetadataChip data={metadata} metakey="cfgScale" />
                <MetadataChip data={metadata} metakey="rng" />
                <MetadataChip data={metadata} metakey="samplingMethod" />
                <MetadataChip data={metadata} metakey="scheduler" />
              </div>
              <MetadataChip data={metadata} metakey="version" />
            </div>
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
