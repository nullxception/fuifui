import { useEffect } from "react";
import type { UserConfig } from "server/types";
import { useConfigStore } from "./useConfigStore";

export function useConfig<T>(key: keyof UserConfig, fallback: T) {
  const value = useConfigStore((s) =>
    s.config[key] !== undefined ? (s.config[key] as T) : fallback,
  );

  const setKey = useConfigStore((s) => s.setKey);
  const loadConfig = useConfigStore((s) => s.loadConfig);
  const isLoading = useConfigStore((s) => s.isLoading);

  // auto-load once
  useEffect(() => {
    if (!isLoading) loadConfig();
  }, [isLoading, loadConfig]);

  const setValue = (v: T | ((prev: T) => T)) => {
    const actual = v instanceof Function ? v(value) : v;
    setKey(key, actual);
  };

  return [value, setValue] as const;
}
export default useConfig;
