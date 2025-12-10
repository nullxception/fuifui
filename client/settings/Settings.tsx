import { Logo } from "client/components/Header";
import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import BackgroundSetting from "./BackgroundSetting";
import SliderSettings from "./SliderSettings";
import TriggerWordsEditor from "./TriggerWordsEditor";

const Settings = forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  (props, ref) => {
    return (
      <motion.div ref={ref} className="flex flex-col justify-center" {...props}>
        <div className="flex w-full p-4 md:hidden">
          <Logo />
        </div>
        <div className="container mx-auto scrollbar-thin flex min-h-0 max-w-screen-2xl flex-1 flex-col overflow-y-auto pb-20 lg:overflow-hidden">
          <div className="grid grid-flow-row grid-cols-1 gap-2 p-4 md:grid-cols-2 md:flex-row">
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
