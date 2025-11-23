import React, { useMemo } from "react";
import type { BackgroundSettings } from "../stores";

const BackgroundLayer: React.FC<{ bg: BackgroundSettings }> = ({ bg }) => {
  const url = useMemo(() => {
    if (bg.type === "none" || !bg.image) {
      return null;
    }

    return bg.image;
  }, [bg.image, bg.type]);

  return (
    <div
      className="-z-2 fixed h-screen w-full top-0 left-0 bg-radial-[at_50%_0%] from-purple-950 to-black bg-cover bg-no-repeat"
      style={url ? { backgroundImage: `url(${url})` } : {}}
    >
      <div
        className="-z-1 fixed top-0 left-0 w-full h-screen bg-radial from-transparent from-50% to-black"
        hidden={url ? false : true}
      />
    </div>
  );
};

export default BackgroundLayer;
