import { defaultSettings } from "../../server/defaults";
import type { AppSettings } from "../../server/types";
import useConfig from "../stores/useConfig";

export const useSettings = () => {
  const [app, setApp] = useConfig<AppSettings>("settings", defaultSettings);

  return {
    app,
    update: (key: keyof AppSettings, value: AppSettings[keyof AppSettings]) => {
      setApp((prev) => ({ ...prev, [key]: value }));
    },
    updateAll: (partial: Partial<AppSettings>) => {
      setApp((prev) => ({ ...prev, ...partial }));
    },
  };
};
