import { useCallback, useEffect, useRef, useState } from "react";
import { useDiffusionConfig } from "../stores";

type PromptType = "prompt" | "negativePrompt";

interface PromptState {
  value: string;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}

const DEBOUNCE_DELAY = 500;

export const usePromptState = (type: PromptType) => {
  const store = useDiffusionConfig();
  const storeValue =
    type === "prompt" ? store.params.prompt : store.params.negativePrompt;

  const [state, setState] = useState<PromptState>(() => ({
    value: storeValue,
    isSaving: false,
    hasUnsavedChanges: false,
  }));

  const debounceTimerRef = useRef<number>(null);

  // Only update if user isn't actively editing and values are different
  if (!state.hasUnsavedChanges && state.value !== storeValue) {
    setState({
      value: storeValue,
      isSaving: false,
      hasUnsavedChanges: false,
    });
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const saveToStore = useCallback(
    async (value: string) => {
      setState((prev) => ({ ...prev, isSaving: true }));

      try {
        store.update(type, value);
        setState((prev) => ({
          ...prev,
          isSaving: false,
          hasUnsavedChanges: false,
        }));
      } catch (error) {
        console.error("Failed to save prompt:", error);
        setState((prev) => ({ ...prev, isSaving: false }));
      }
    },
    [store, type],
  );

  const debouncedSave = useCallback(
    (value: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      setState((prev) => ({ ...prev, hasUnsavedChanges: true }));

      debounceTimerRef.current = window.setTimeout(() => {
        saveToStore(value);
        debounceTimerRef.current = null;
      }, DEBOUNCE_DELAY);
    },
    [saveToStore],
  );

  const updatePrompt = useCallback(
    (newValue: string) => {
      setState((prev) => ({ ...prev, value: newValue }));
      debouncedSave(newValue);
    },
    [debouncedSave],
  );

  const forceSave = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    saveToStore(state.value);
  }, [saveToStore, state.value]);

  return {
    value: state.value,
    isSaving: state.isSaving,
    hasUnsavedChanges: state.hasUnsavedChanges,
    updatePrompt,
    forceSave,
  };
};
