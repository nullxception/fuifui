import React from "react";
import { useDataStore, useDiffusionConfigStore } from "../../stores";
import { Select } from "../ui/Select";
import { Label } from "../ui/Label";

export const ModelSelector: React.FC = () => {
  const { models, vaes } = useDataStore();
  const store = useDiffusionConfigStore();

  return (
    <div className="px-4 pb-4 grid grid-cols-2 gap-2">
      <div className="space-y-4">
        <Label htmlFor="model-select">Model</Label>
        <Select
          id="model-select"
          value={store.params.model}
          onChange={(e) => store.updateModel(e.target.value)}
        >
          {models.map((model) => (
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
          onChange={(e) => store.updateVae(e.target.value)}
        >
          <option key="none" value="">
            Unset
          </option>
          {vaes.map((vae) => (
            <option key={vae} value={vae}>
              {vae}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
};
