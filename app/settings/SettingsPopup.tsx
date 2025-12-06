import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, type HTMLMotionProps } from "framer-motion";
import { XIcon } from "lucide-react";
import { forwardRef } from "react";
import BackgroundSetting from "./BackgroundSetting";
import SliderSettings from "./SliderSettings";
import TriggerWordsEditor from "./TriggerWordsEditor";

const SettingsPopup = forwardRef<
  HTMLDivElement,
  HTMLMotionProps<"div"> & {
    isShowing: boolean;
    show: (x: boolean) => void;
  }
>(({ isShowing, show, ...props }, ref) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      show(false);
    }
  };

  if (!isShowing) return null;

  return (
    <motion.div
      ref={ref}
      className="fixed inset-0 z-40 flex h-screen items-center justify-center bg-background/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
      {...props}
    >
      <Card className="flex max-h-screen w-screen flex-col overflow-clip rounded-none border-border bg-background/90 pb-20 shadow-2xl scrollbar-thumb-border scrollbar-track-border md:max-h-[80vh] md:w-[90vw] md:rounded-lg md:pb-0 lg:w-[70vw]">
        <div className="bg-surface sticky top-0 z-10 flex flex-row items-center justify-between border-b border-border p-2">
          <div className="px-2 leading-none font-semibold tracking-tight">
            Settings
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => show(false)}
            className="h-8 w-8"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="scrollbar-thin overflow-y-auto">
          <div className="grid grid-flow-row grid-cols-1 gap-4 p-4 md:grid-cols-2 md:flex-row">
            <BackgroundSetting />
            <SliderSettings />
            <TriggerWordsEditor />
          </div>
        </div>
      </Card>
    </motion.div>
  );
});

export default SettingsPopup;
