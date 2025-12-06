import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTriggerWords } from "@/settings/useTriggerWords";
import React, { useLayoutEffect, useRef, useState } from "react";
import type { ExtraDataType } from "server/types";
import { optimizePrompt } from "../lib/metadataParser";
import { useModels } from "./useModels";
import { usePromptState } from "./usePromptState";

type PromptType = "prompt" | "negativePrompt";

const ExtraSelector: React.FC<{
  onAddExtra: (filename: string) => void;
  extras: string[];
  type: ExtraDataType;
}> = ({ onAddExtra, extras, type }) => {
  const [value, setValue] = useState("");
  return (
    <Select
      value={value}
      onValueChange={(e) => {
        if (e) {
          onAddExtra(e);
          // reset value after selecting
          setTimeout(() => setValue(""));
        }
      }}
    >
      <SelectTrigger className="w-full" indicator="plus">
        <SelectValue
          placeholder={`Add ${type === "lora" ? "LoRA" : "Embedding"}`}
        />
      </SelectTrigger>
      <SelectContent>
        {extras.map((extra) => (
          <SelectItem key={extra} value={extra}>
            {extra}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

function autoResize(el: HTMLTextAreaElement) {
  requestAnimationFrame(() => {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  });
}

function Prompt({ type }: { type: PromptType }) {
  const { models } = useModels();
  const { value, changed, updatePrompt, forceSave } = usePromptState(type);
  const ref = useRef<HTMLTextAreaElement>(null);
  const { triggerWords } = useTriggerWords();
  const title = type === "prompt" ? "Prompt" : "Negative Prompt";

  const addExtraData = (filename: string, extraType: ExtraDataType) => {
    console.log(triggerWords);
    // Find matching trigger words for this embedding/lora
    const matchingTrigger = triggerWords.find(
      (tw) => tw.type === extraType && tw.target.startsWith(filename),
    );

    // Build the text to add: prefix + trigger words (if any)
    const triggerWordsText = matchingTrigger?.words.join(", ") || "";
    const loraStrength = matchingTrigger?.loraStrength || 1;

    const name = filename.replace(/\.(safetensors|ckpt)$/, "");
    const prefix =
      extraType === "lora"
        ? `<lora:${name}:${loraStrength}>`
        : `embedding:${name}`;
    const textToAdd = triggerWordsText
      ? `${prefix}, ${triggerWordsText}`
      : prefix;

    const newPrompt = optimizePrompt(`${textToAdd}, ${value}`);
    updatePrompt(newPrompt);
  };

  useLayoutEffect(() => {
    if (ref.current) {
      autoResize(ref.current);
    }
  }, [value]);

  return (
    <div className="space-y-2 px-4">
      <div className="flex items-center justify-between">
        <Label
          className={`${type === "prompt" ? "text-blue-500" : "text-pink-500"}`}
        >
          {title}
        </Label>
        <div className="flex items-center gap-2 text-xs">
          {changed && (
            <span className="flex items-center gap-1 text-foreground/90">
              <span className="h-2 w-2 animate-pulse rounded-full bg-foreground"></span>
              Saving...
            </span>
          )}
        </div>
      </div>
      <Textarea
        ref={ref}
        value={value}
        onChange={(e) => {
          updatePrompt(e.target.value);
        }}
        onBlur={() => {
          forceSave();
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
}

export function PromptInput() {
  return (
    <div className="flex flex-col space-y-4">
      <Prompt type="prompt" />
      <Prompt type="negativePrompt" />
    </div>
  );
}
