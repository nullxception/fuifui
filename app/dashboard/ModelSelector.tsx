import React from "react";
import { useDiffusionConfig, useModels } from "../stores";
import { Label } from "../ui/Label";
import { Select } from "../ui/Select";

export const ModelSelector: React.FC = () => {
  const { models } = useModels();
  const store = useDiffusionConfig();

  return (
    <div className="grid grid-cols-2 gap-2 px-4 pb-4">
      <div className="space-y-4">
        <Label htmlFor="model-select">Model</Label>
        <Select
          id="model-select"
          value={store.params.model}
          onChange={(e) => store.update("model", e.target.value)}
        >
          {models.checkpoints.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-4">
        <Label htmlFor="vae-select">VAE</Label>
        <Select
          id="vae-select"
          value={store.params.vae}
          onChange={(e) => store.update("vae", e.target.value)}
        >
          <option key="none" value="">
            Unset
          </option>
          {models.vaes.map((vae) => (
            <option key={vae} value={vae}>
              {vae}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
};
