import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { defaultSettings } from "server/defaults";
import { useSettings } from "./useSettings";

const SliderSettings: React.FC = () => {
  const { app, update } = useSettings();
  return (
    <div className={`mb-4 space-y-4 space-x-4`}>
      <div className="flex w-full flex-col justify-between space-y-2">
        <Label>Max width slider</Label>
        <Input
          type="number"
          placeholder={`default: ${defaultSettings.maxWidth}`}
          min={64}
          step={64}
          value={app.maxWidth}
          onChange={(e) => update("maxWidth", parseInt(e.target.value))}
        />
      </div>
      <div className="flex w-full flex-col justify-between space-y-2">
        <Label>Max height slider</Label>
        <Input
          type="number"
          placeholder={`default: ${defaultSettings.maxHeight}`}
          min={64}
          step={64}
          value={app.maxHeight}
          onChange={(e) => update("maxHeight", parseInt(e.target.value))}
        />
      </div>
    </div>
  );
};

export default SliderSettings;
