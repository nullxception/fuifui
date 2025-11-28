import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { ExtraDataType } from "server/types";
import { optimizePrompt } from "../lib/metadataParser";
import { useDiffusionConfig, useModels, useTriggerWords } from "../stores";

type PromptType = "prompt" | "negativePrompt";

const ExtraSelector: React.FC<{
  onAddExtra: (filename: string) => void;
  extras: string[];
  type: ExtraDataType;
}> = ({ onAddExtra, extras, type }) => (
  <Select
    onValueChange={(e) => {
      if (e) {
        onAddExtra(e);
        e = "";
      }
    }}
  >
    <SelectTrigger className="w-full">
      <SelectValue
        placeholder={`Add ${type === "lora" ? "LoRA" : "Embedding"}`}
      />
    </SelectTrigger>
    <SelectContent>
      {extras.map((extra) => (
        <SelectItem key={extra} value={extra}>
          {extra.replace(".safetensors", "")}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

const autoResize = (el: HTMLTextAreaElement, cb: () => void) => {
  requestAnimationFrame(() => {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
    cb();
  });
};

const Prompt: React.FC<{ type: PromptType }> = ({ type }) => {
  const { models } = useModels();
  const store = useDiffusionConfig();
  const prompt =
    type === "prompt" ? store.params.prompt : store.params.negativePrompt;
  const ref = useRef<HTMLTextAreaElement>(null);
  const { triggerWords } = useTriggerWords();
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const title = type === "prompt" ? "Prompt" : "Negative Prompt";

  const updateCaret = useCallback(() => {
    if (ref.current) {
      const { selectionStart, selectionEnd } = ref.current;

      setStart(selectionStart);
      setEnd(selectionEnd);
    }
  }, []);

  const addExtraData = (filename: string, extraType: ExtraDataType) => {
    const name = filename.replace(".safetensors", "");
    const prefix =
      extraType === "lora" ? `<lora:${name}:1>` : `embedding:${name}`;

    // Find matching trigger words for this embedding/lora
    const matchingTrigger = triggerWords.find(
      (tw) => tw.type === extraType && tw.target === name,
    );

    // Build the text to add: prefix + trigger words (if any)
    const triggerWordsText = matchingTrigger?.words.join(", ") || "";
    const textToAdd = triggerWordsText
      ? `${prefix}, ${triggerWordsText}`
      : prefix;

    store.update(type, optimizePrompt(`${textToAdd}, ${prompt}`));
  };

  useEffect(() => {
    if (ref.current) {
      ref.current.setSelectionRange(start, end);
    }
  });

  useLayoutEffect(() => {
    const el = ref.current;
    if (el) {
      autoResize(el, updateCaret);
    }
  }, [updateCaret, prompt]);

  return (
    <div
      className={`space-y-2 p-4 ${type === "prompt" ? "bg-blue-500/20" : "bg-pink-500/20"}`}
    >
      <Label className="pb-2">{title}</Label>
      <Textarea
        ref={ref}
        value={prompt}
        onChange={(e) => {
          store.update(type, e.target.value);
          updateCaret();
        }}
        className={`scrollbar-none ${
          type === "prompt"
            ? "focus-visible:ring-blue-500/50"
            : "focus-visible:ring-pink-500/50"
        }`}
        placeholder={`Enter your ${title.toLowerCase()} here...`}
        spellCheck={false}
      />
      <div className="grid grid-cols-2 gap-2">
        {models.embeddings.length > 0 && (
          <ExtraSelector
            type="embedding"
            onAddExtra={(file) => addExtraData(file, "embedding")}
            extras={models.embeddings}
          />
        )}
        {models.loras.length > 0 && (
          <ExtraSelector
            type="lora"
            onAddExtra={(file) => addExtraData(file, "lora")}
            extras={models.loras}
          />
        )}
      </div>
    </div>
  );
};

export const PromptInput: React.FC = () => {
  return (
    <div>
      <Prompt type="prompt" />
      <Prompt type="negativePrompt" />
    </div>
  );
};
