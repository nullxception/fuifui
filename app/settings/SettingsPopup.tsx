import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XIcon } from "lucide-react";
import { useAppStore } from "../stores";
import BackgroundSetting from "./BackgroundSetting";
import SliderSettings from "./SliderSettings";
import TriggerWordsEditor from "./TriggerWordsEditor";

const SettingsPopup: React.FC = () => {
  const { showSettings, setShowSettings } = useAppStore();

  if (!showSettings) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowSettings(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <Card className="mx-4 flex max-h-[80vh] w-[90vw] flex-col overflow-clip border-border bg-background/90 shadow-2xl scrollbar-thumb-border scrollbar-track-border lg:w-[70vw]">
        <div className="bg-surface sticky top-0 z-10 flex flex-row items-center justify-between border-b border-border p-2">
          <div className="px-2 leading-none font-semibold tracking-tight">
            Settings
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(false)}
            className="h-8 w-8"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="scrollbar-thin overflow-y-auto">
          <div className="flex flex-col space-y-6 space-x-4 p-4 md:flex-row">
            <div className="flex w-full flex-col">
              <BackgroundSetting />
            </div>
            <div className="flex w-full flex-col">
              <SliderSettings />
              <TriggerWordsEditor />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPopup;
