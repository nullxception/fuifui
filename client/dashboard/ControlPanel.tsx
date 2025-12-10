import { Footer } from "client/components/Footer";
import { Card } from "client/components/ui/card";
import { GenerationSettings } from "./GenerationSettings";
import { ModelSelector } from "./ModelSelector";
import { PromptInput } from "./PromptInput";

export function ControlPanel() {
  return (
    <div className="flex w-full flex-col lg:max-h-screen lg:w-[40vw]">
      <Card className="scrollbar-thin w-full flex-1 grow space-y-4 overflow-y-auto py-4 backdrop-blur-md scrollbar-thumb-secondary scrollbar-track-transparent lg:max-h-full lg:w-[40vw] lg:shrink-0">
        <ModelSelector />
        <PromptInput />
        <GenerationSettings />
      </Card>
      <Footer />
    </div>
  );
}
