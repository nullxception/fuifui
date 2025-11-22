import React, { useEffect } from "react";
import { useDataStore, useDiffusionConfigStore } from "../../stores";
import { Label } from "../ui/Label";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import { optimizePrompt } from "../../utils/metadataParser";

const EmbeddingSelector: React.FC<{
  target: "prompt" | "negativePrompt";
  onAddEmbedding: (
    filename: string,
    target: "prompt" | "negativePrompt",
  ) => void;
  embeddings: string[];
}> = ({ target, onAddEmbedding, embeddings }) => (
  <Select
    onChange={(e) => {
      if (e.target.value) {
        onAddEmbedding(e.target.value, target);
        e.target.value = "";
      }
    }}
    className="text-xs h-8"
  >
    <option value="">Add Embedding</option>
    {embeddings.map((embedding) => (
      <option key={embedding} value={embedding}>
        {embedding.replace(".safetensors", "")}
      </option>
    ))}
  </Select>
);

const LoraSelector: React.FC<{
  target: "prompt" | "negativePrompt";
  onAddLora: (filename: string, target: "prompt" | "negativePrompt") => void;
  loras: string[];
}> = ({ target, onAddLora, loras }) => (
  <Select
    onChange={(e) => {
      if (e.target.value) {
        onAddLora(e.target.value, target);
        e.target.value = "";
      }
    }}
    className="text-xs h-8"
  >
    <option value="">Add LoRA</option>
    {loras.map((lora) => (
      <option key={lora} value={lora}>
        {lora.replace(".safetensors", "")}
      </option>
    ))}
  </Select>
);

export const PromptInput: React.FC = () => {
  const { embeddings, loras, fetchEmbeddings, fetchLoras } = useDataStore();
  const store = useDiffusionConfigStore();
  const autoResize = (element: HTMLTextAreaElement) => {
    element.style.height = "auto";
    element.style.height = element.scrollHeight + "px";
  };

  const addEmbedding = (
    embeddingFilename: string,
    target: "prompt" | "negativePrompt",
  ) => {
    const embeddingName = embeddingFilename.replace(".safetensors", "");
    const embeddingText = `embedding:${embeddingName}, `;
    store.update(
      target,
      optimizePrompt(
        embeddingText + target === "prompt"
          ? store.params.prompt
          : store.params.negativePrompt,
      ),
    );
  };

  const addLora = (
    loraFilename: string,
    target: "prompt" | "negativePrompt",
  ) => {
    const loraName = loraFilename.replace(".safetensors", "");
    const loraText = `<lora:${loraName}:1>, `;
    store.update(
      target,
      optimizePrompt(
        loraText + target === "prompt"
          ? store.params.prompt
          : store.params.negativePrompt,
      ),
    );
  };

  useEffect(() => {
    fetchEmbeddings();
  }, [fetchEmbeddings]);

  useEffect(() => {
    fetchLoras();
  }, [fetchLoras]);

  return (
    <div>
      {/* Positive Prompt */}
      <div className="p-4 bg-blue-500/20 space-y-4">
        <Label className="block text-xs font-medium uppercase tracking-wider">
          Prompt
        </Label>
        <Textarea
          ref={(element) => {
            if (element) autoResize(element);
          }}
          value={store.params.prompt}
          onChange={(e) => {
            store.update("prompt", e.target.value);
            autoResize(e.target);
          }}
          className="focus-visible:ring-blue-500"
          placeholder="Enter your prompt here..."
          spellCheck={false}
        />
        <div className="grid grid-cols-2 gap-2">
          {embeddings.length > 0 && (
            <EmbeddingSelector
              target="prompt"
              onAddEmbedding={addEmbedding}
              embeddings={embeddings}
            />
          )}
          {loras.length > 0 && (
            <LoraSelector target="prompt" onAddLora={addLora} loras={loras} />
          )}
        </div>
      </div>
      <div className="p-4 bg-pink-500/20 space-y-4">
        <Label>Negative Prompt</Label>
        <Textarea
          ref={(element) => {
            if (element) autoResize(element);
          }}
          value={store.params.negativePrompt}
          onChange={(e) => {
            store.update("negativePrompt", e.target.value);
            autoResize(e.target);
          }}
          className="focus-visible:ring-pink-500"
          placeholder="Enter negative prompt..."
          spellCheck={false}
        />
        <div className="grid grid-cols-2 gap-2">
          {embeddings.length > 0 && (
            <EmbeddingSelector
              target="negativePrompt"
              onAddEmbedding={addEmbedding}
              embeddings={embeddings}
            />
          )}
          {loras.length > 0 && (
            <LoraSelector
              target="negativePrompt"
              onAddLora={addLora}
              loras={loras}
            />
          )}
        </div>
      </div>
    </div>
  );
};
