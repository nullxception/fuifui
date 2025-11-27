import React from "react";
import { useSettings } from "../stores";

const BackgroundLayer: React.FC = () => {
  const { app } = useSettings();
  const bg = app.background;
  const hasBg = bg.length > 0;
  return (
    <div
      className="fixed top-1/2 left-1/2 -z-2 h-screen w-full -translate-1/2 bg-radial-[at_50%_0%] from-purple-950 to-black bg-cover bg-center bg-no-repeat"
      style={hasBg ? { backgroundImage: `url(${bg})` } : {}}
    >
      <div
        className="fixed top-0 left-0 -z-1 h-screen w-full bg-radial from-transparent from-50% to-black"
        hidden={hasBg}
      />
    </div>
  );
};

export default BackgroundLayer;
