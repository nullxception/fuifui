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
    <div className="grid grid-cols-2 gap-2 px-4">
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
        <Label htmlFor="model-select">Type</Label>
        <Select
          value={store.params.modelType}
          onValueChange={(e) => store.update("modelType", e)}
        >
          <SelectTrigger id="model-select" className="w-full">
            <SelectValue placeholder="Select a model type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem key="standalone" value="standalone">
                Standalone Model
              </SelectItem>
              <SelectItem key="full" value="full">
                Full Model
              </SelectItem>
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
        <Label htmlFor="clip-l-select">Clip-L</Label>
        <Select
          value={store.params.clipL}
          onValueChange={(e) => {
            if (e === "unset") {
              store.update("clipL", "");
              return;
            }
            store.update("clipL", e);
          }}
        >
          <SelectTrigger id="clip-l-select" className="w-full">
            <SelectValue placeholder="Select Clip-L" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="unset">unset</SelectItem>
              {models.textEncoders.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 pt-2">
        <Label htmlFor="clip-g-select">Clip-G</Label>
        <Select
          value={store.params.clipG}
          onValueChange={(e) => {
            if (e === "unset") {
              store.update("clipG", "");
              return;
            }
            store.update("clipG", e);
          }}
        >
          <SelectTrigger id="clip-g-select" className="w-full">
            <SelectValue placeholder="Select Clip-G" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="unset">unset</SelectItem>
              {models.textEncoders.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 pt-2">
        <Label htmlFor="t5xxl-select">T5 XXL</Label>
        <Select
          value={store.params.t5xxl}
          onValueChange={(e) => {
            if (e === "unset") {
              store.update("t5xxl", "");
              return;
            }
            store.update("t5xxl", e);
          }}
        >
          <SelectTrigger id="t5xxl-select" className="w-full">
            <SelectValue placeholder="Select T5 XXL" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="unset">unset</SelectItem>
              {models.textEncoders.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 pt-2">
        <Label htmlFor="upscaleModel-select">Upscaler</Label>
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
            <SelectValue placeholder="Select Upscaler" />
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

      <div className="space-y-2 pt-2">
        <Label htmlFor="llm-select">LLM</Label>
        <Select
          value={store.params.llm}
          onValueChange={(e) => {
            if (e === "unset") {
              store.update("llm", "");
              return;
            }
            store.update("llm", e);
          }}
        >
          <SelectTrigger id="llm-select" className="w-full">
            <SelectValue placeholder="Select LLM" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="unset">unset</SelectItem>
              {models.llms.map((model) => (
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
