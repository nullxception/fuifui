import React, { useMemo } from "react";

interface BackgroundSettings {
  imageType: "none" | "upload" | "url";
  imageData: string;
}

interface BackgroundLayerProps {
  settings: BackgroundSettings;
}

const BackgroundLayer: React.FC<BackgroundLayerProps> = ({ settings }) => {
  const imageUrl = useMemo(() => {
    if (settings.imageType === "none" || !settings.imageData) {
      return null;
    }

    return settings.imageData;
  }, [settings.imageData, settings.imageType]);

  if (!imageUrl) {
    return null;
  }

  const backgroundStyle: React.CSSProperties = {
    backgroundImage: `url(${imageUrl})`,
  };

  return (
    <div className="wallpaper" style={backgroundStyle}>
      <div />
    </div>
  );
};

export default BackgroundLayer;
