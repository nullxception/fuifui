import React from "react";
import { ModelSelector } from "./Panel/ModelSelector";
import { PromptInput } from "./Panel/PromptInput";
import { GenerationSettings } from "./Panel/GenerationSettings";
import { Card } from "./ui/Card";
import { Footer } from "./Footer";

const ControlPanel: React.FC = () => {
  return (
    <div className="w-full lg:w-[40vw] lg:max-h-screen flex flex-col ">
      <Card className="w-full lg:w-[40vw] flex-1 lg:shrink-0 overflow-y-auto grow lg:max-h-full scrollbar-thin scrollbar-thumb-secondary scrollbar-track-transparent py-4">
        <ModelSelector />
        <PromptInput />
        <GenerationSettings />
      </Card>
      <Footer />
    </div>
  );
};

export default ControlPanel;
