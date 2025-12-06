import { optimizePrompt } from "@/lib/metadataParser";
import type { ExtraDataType, TriggerWord } from "server/types";
import useConfig from "../stores/useConfig";

export function useTriggerWords() {
  const [triggerWords, setTriggerWords] = useConfig<TriggerWord[]>(
    "triggerWords",
    [],
  );

  return {
    triggerWords,
    setTriggerWords,

    addTriggerWord: (word: TriggerWord) =>
      setTriggerWords((prev) => [...prev, word]),

    updateTriggerWord: (index: number, word: TriggerWord) =>
      setTriggerWords((prev) => {
        const newWords = [...prev];
        newWords[index] = word;
        return newWords;
      }),

    deleteTriggerWord: (index: number) =>
      setTriggerWords((prev) => prev.filter((_, i) => i !== index)),

    reset: () => setTriggerWords([]),
    buildPrompt(prompt: string, filename: string, type: ExtraDataType) {
      // Find matching trigger words for this embedding/lora
      const match = triggerWords.find(
        (tw) => tw.type === type && tw.target.startsWith(filename),
      );
      const words = match?.words ?? [];
      const name = filename.replace(/\.(safetensors|ckpt)$/, "");
      const strength = match?.loraStrength || 1;
      const embed =
        type === "lora" ? `<lora:${name}:${strength}>` : `embedding:${name}`;

      return optimizePrompt([embed, ...words, prompt].join(","));
    },
  };
}
