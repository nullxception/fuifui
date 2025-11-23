import useYamlConf from "../hooks/useYamlConf";

export interface BackgroundSettings {
  type: "none" | "upload" | "url";
  image: string;
}

export const useBackgroundSettingsStore = () => {
  const [bg, setBg] = useYamlConf<BackgroundSettings>("background", {
    type: "none",
    image: "",
  });

  return {
    bg,
    setBg,

    setType: (type: BackgroundSettings["type"]) =>
      setBg((prev) => ({ ...prev, type })),
    setImage: (image: string) => setBg((prev) => ({ ...prev, image })),
    reset: () => setBg({ type: "none", image: "" }),
  };
};
