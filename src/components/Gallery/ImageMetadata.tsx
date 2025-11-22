import type { Image, ParsedMetadata } from "../../utils/metadataParser";
import { useAppStore, useDiffusionConfigStore } from "../../stores";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";

interface ImageMetadataProps {
  image: Image;
  parsedMetadata: ParsedMetadata | null;
  className: string;
}

export default function ImageMetadata({
  image,
  parsedMetadata,
  className = "",
}: ImageMetadataProps) {
  const { setActiveTab } = useAppStore();
  const diffusionConfig = useDiffusionConfigStore();

  const handleRemake = () => {
    if (!parsedMetadata) return;

    // Map parsed metadata to diffusion config parameters
    const paramsToUpdate: Partial<{
      prompt: string;
      negativePrompt: string;
      steps: number;
      cfgScale: number;
      width: number;
      height: number;
      samplingMethod: string;
      scheduler: string;
      seed: number;
      model: string;
    }> = {};

    if (parsedMetadata.prompt) {
      paramsToUpdate.prompt = parsedMetadata.prompt;
    }

    if (parsedMetadata.negativePrompt) {
      paramsToUpdate.negativePrompt = parsedMetadata.negativePrompt;
    }

    // Map other parameters
    const { otherParams } = parsedMetadata;

    if (otherParams.steps !== undefined) {
      paramsToUpdate.steps = Number(otherParams.steps);
    }

    if (otherParams.cfgScale !== undefined) {
      paramsToUpdate.cfgScale = Number(otherParams.cfgScale);
    }

    if (otherParams.width !== undefined) {
      paramsToUpdate.width = Number(otherParams.width);
    }

    if (otherParams.height !== undefined) {
      paramsToUpdate.height = Number(otherParams.height);
    }

    if (otherParams.samplingMethod !== undefined) {
      paramsToUpdate.samplingMethod = String(otherParams.samplingMethod);
    }

    if (otherParams.scheduler !== undefined) {
      paramsToUpdate.scheduler = String(otherParams.scheduler);
    }

    if (otherParams.seed !== undefined) {
      paramsToUpdate.seed = Number(otherParams.seed);
    }

    if (otherParams.model !== undefined) {
      paramsToUpdate.model = String(otherParams.model);
    }

    // Update all parameters at once
    diffusionConfig.updateAll(paramsToUpdate);

    // Navigate back to generate tab
    setActiveTab("generate");
  };

  return (
    <div
      className={`w-full md:w-[400px] bg-surface/95 backdrop-blur-sm p-6 overflow-y-auto border-l border-border flex flex-col gap-6 ${className}`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Details</h3>
        {parsedMetadata && (
          <Button onClick={handleRemake} size="sm" variant="primary">
            Remake
          </Button>
        )}
      </div>

      <div className="space-y-6">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">
            Created
          </Label>
          <p className="text-white text-sm font-mono">
            {new Date(image.mtime).toLocaleString()}
          </p>
        </div>

        {parsedMetadata ? (
          <div className="space-y-2">
            {parsedMetadata.prompt && (
              <div className="bg-black/20 p-2 rounded border border-border/50">
                <Label className="text-[10px] text-pink-400 uppercase tracking-wider block mb-1">
                  Prompt
                </Label>
                <p className="text-gray-200 text-xs truncate font-mono whitespace-pre-wrap">
                  {parsedMetadata.prompt}
                </p>
              </div>
            )}

            {parsedMetadata.negativePrompt && (
              <div className="bg-black/20 p-2 rounded border border-border/50">
                <Label className="text-[10px] text-pink-400 uppercase tracking-wider block mb-1">
                  Negative Prompt
                </Label>
                <p className="text-gray-200 text-xs truncate font-mono whitespace-pre-wrap">
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
                      className="bg-black/20 p-2 rounded border border-border/50"
                    >
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">
                        {key}
                      </Label>
                      <p className="text-gray-200 text-xs font-mono wrap-break-word">
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
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                {key}
              </Label>
              <div className="text-gray-300 text-sm whitespace-pre-wrap wrap-break-word font-mono bg-black/20 p-2 rounded border border-border/50">
                {typeof value === "object"
                  ? JSON.stringify(value, null, 2)
                  : String(value)}
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-sm italic">
            No metadata found.
          </p>
        )}
      </div>
    </div>
  );
}
