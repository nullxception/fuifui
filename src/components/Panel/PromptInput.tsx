import React, { useEffect, useLayoutEffect, useRef } from "react";
import { useDataStore, useDiffusionConfigStore } from "../../stores";
import { Label } from "../ui/Label";
import { SelectAdd } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import { optimizePrompt } from "../../utils/metadataParser";

const ExtraSelector: React.FC<{
  target: "prompt" | "negativePrompt";
  onAddExtra: (filename: string, target: "prompt" | "negativePrompt") => void;
  extras: string[];
  type: "Embedding" | "LoRA";
}> = ({ target, onAddExtra, extras, type }) => (
  <SelectAdd
    onChange={(e) => {
      if (e.target.value) {
        onAddExtra(e.target.value, target);
        e.target.value = "";
      }
    }}
    className="text-xs h-8"
  >
    <option value="">Add {type}</option>
    {extras.map((extra) => (
      <option key={extra} value={extra}>
        {extra.replace(".safetensors", "")}
      </option>
    ))}
  </SelectAdd>
);

const autoResize = (element: HTMLTextAreaElement) => {
  element.style.height = "auto";
  element.style.height = element.scrollHeight + "px";
};

export const PromptInput: React.FC = () => {
  const { embeddings, loras, fetchEmbeddings, fetchLoras } = useDataStore();
  const store = useDiffusionConfigStore();
  const promptRef = useRef(null);
  const negativePromptRef = useRef(null);

  const addExtraData = (
    filename: string,
    target: "prompt" | "negativePrompt",
    type: "embedding" | "lora",
  ) => {
    const name = filename.replace(".safetensors", "");
    const prefix = type === "lora" ? `<lora:${name}:1>` : `embedding:${name}`;
    const prompt =
      target === "prompt" ? store.params.prompt : store.params.negativePrompt;
    store.update(target, optimizePrompt(`${prefix}, ${prompt}`));
  };

  useEffect(() => {
    fetchEmbeddings();
  }, [fetchEmbeddings]);

  useEffect(() => {
    fetchLoras();
  }, [fetchLoras]);

  useLayoutEffect(() => {
    const el = promptRef.current;
    if (el) autoResize(el);
  }, [store.params.prompt]);

  useLayoutEffect(() => {
    const el = negativePromptRef.current;
    if (el) autoResize(el);
  }, [store.params.negativePrompt]);

  return (
    <div>
      {/* Positive Prompt */}
      <div className="p-4 bg-blue-500/20 space-y-2">
        <Label className="pb-2">Prompt</Label>
        <Textarea
          ref={promptRef}
          value={store.params.prompt}
          onChange={(e) => store.update("prompt", e.target.value)}
          className="focus-visible:ring-blue-500"
          placeholder="Enter your prompt here..."
          spellCheck={false}
        />
        <div className="grid grid-cols-2 gap-2">
          {embeddings.length > 0 && (
            <ExtraSelector
              type="Embedding"
              target="prompt"
              onAddExtra={(file, target) =>
                addExtraData(file, target, "embedding")
              }
              extras={embeddings}
            />
          )}
          {loras.length > 0 && (
            <ExtraSelector
              type="LoRA"
              target="prompt"
              onAddExtra={(file, target) => addExtraData(file, target, "lora")}
              extras={loras}
            />
          )}
        </div>
      </div>
      <div className="p-4 bg-pink-500/20 space-y-2">
        <Label className="pb-2">Negative Prompt</Label>
        <Textarea
          ref={negativePromptRef}
          value={store.params.negativePrompt}
          onChange={(e) => store.update("negativePrompt", e.target.value)}
          className="focus-visible:ring-pink-500"
          placeholder="Enter negative prompt..."
          spellCheck={false}
        />
        <div className="grid grid-cols-2 gap-2">
          {embeddings.length > 0 && (
            <ExtraSelector
              type="Embedding"
              target="negativePrompt"
              onAddExtra={(file, target) =>
                addExtraData(file, target, "embedding")
              }
              extras={embeddings}
            />
          )}
          {loras.length > 0 && (
            <ExtraSelector
              type="LoRA"
              target="negativePrompt"
              onAddExtra={(file, target) => addExtraData(file, target, "lora")}
              extras={loras}
            />
          )}
        </div>
      </div>
    </div>
  );
};
