import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import { useDiffusionConfig, useModels } from "../stores";

export const ModelSelector: React.FC = () => {
  const { models } = useModels();
  const store = useDiffusionConfig();

  return (
    <div className="grid grid-cols-2 gap-2 px-4 pb-4">
      <div className="space-y-2 pt-2">
        <Label htmlFor="model-select">Model</Label>
        <Select
          value={store.params.model}
          onValueChange={(e) => store.update("model", e)}
        >
          <SelectTrigger id="model-select" className="w-full">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {models.checkpoints.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 pt-2">
        <Label htmlFor="vae-select">VAE</Label>
        <Select
          value={store.params.vae}
          onValueChange={(e) => {
            if (e === "unset") {
              store.update("vae", "");
              return;
            }
            store.update("vae", e);
          }}
        >
          <SelectTrigger id="vae-select" className="w-full">
            <SelectValue placeholder="Select VAE" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="unset">unset</SelectItem>
              {models.vaes.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 pt-2">
        <Label htmlFor="upscaleModel-select">Upscaler Model</Label>
        <Select
          value={store.params.upscaleModel}
          onValueChange={(e) => {
            if (e === "unset") {
              store.update("upscaleModel", "");
              return;
            }
            store.update("upscaleModel", e);
          }}
        >
          <SelectTrigger id="upscaleModel-select" className="w-full">
            <SelectValue placeholder="Select upscaler" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="unset">unset</SelectItem>
              {models.upscalers.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
