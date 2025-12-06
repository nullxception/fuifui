import type { TriggerWord } from "server/types";
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
  };
}
