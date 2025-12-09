import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import BackgroundSetting from "./BackgroundSetting";
import SliderSettings from "./SliderSettings";
import TriggerWordsEditor from "./TriggerWordsEditor";

const Settings = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  (props, ref) => {
    return (
      <motion.div
        ref={ref}
        className="flex items-center justify-center bg-background/60 backdrop-blur-sm"
        {...props}
      >
        <div className="scrollbar-thin overflow-y-auto pb-20">
          <h1 className="p-4 text-xl md:hidden">Settings</h1>
          <div className="grid grid-flow-row grid-cols-1 gap-4 p-4 md:grid-cols-2 md:flex-row">
            <BackgroundSetting />
            <SliderSettings />
            <TriggerWordsEditor />
          </div>
        </div>
      </motion.div>
    );
  },
);

export default Settings;
