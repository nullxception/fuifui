import useYamlConf from "../hooks/useYamlConf";

export interface BackgroundSettings {
  imageType: "none" | "upload" | "url";
  imageData: string;
}

// Create a hook that combines Zustand-like interface with YAML persistence
export const useBackgroundSettingsStore = () => {
  const [backgroundSettings, setBackgroundSettings] =
    useYamlConf<BackgroundSettings>("backgroundSettings", {
      imageType: "none",
      imageData: "",
    });

  return {
    backgroundSettings,
    setBackgroundSettings,

    // Convenience methods
    setImageType: (imageType: BackgroundSettings["imageType"]) => {
      setBackgroundSettings((prev) => ({ ...prev, imageType }));
    },

    setImageData: (imageData: string) => {
      setBackgroundSettings((prev) => ({ ...prev, imageData }));
    },

    reset: () => {
      setBackgroundSettings({
        imageType: "none",
        imageData: "",
      });
    },
  };
};
