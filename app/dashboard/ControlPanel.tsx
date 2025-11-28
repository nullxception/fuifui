import { Footer } from "@/components/customized/Footer";
import { Card } from "@/components/ui/card";
import React from "react";
import { GenerationSettings } from "./GenerationSettings";
import { ModelSelector } from "./ModelSelector";
import { PromptInput } from "./PromptInput";

const ControlPanel: React.FC = () => {
  return (
    <div className="flex w-full flex-col lg:max-h-screen lg:w-[40vw]">
      <Card className="scrollbar-thin w-full flex-1 grow overflow-y-auto py-4 scrollbar-thumb-secondary scrollbar-track-transparent lg:max-h-full lg:w-[40vw] lg:shrink-0">
        <ModelSelector />
        <PromptInput />
        <GenerationSettings />
      </Card>
      <Footer />
    </div>
  );
};

export default ControlPanel;
