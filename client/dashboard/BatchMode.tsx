import { SliderInput } from "client/components/SliderInput";
import { Label } from "client/components/ui/label";
import { Switch } from "client/components/ui/switch";
import { useDiffusionConfig } from "./useDiffusionConfig";

export function BatchModeSetting() {
  const store = useDiffusionConfig();

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <Label htmlFor="batchModeSwitch" className="cursor-pointer">
          Batch generation
        </Label>
        <Switch
          id="batchModeSwitch"
          checked={store.params.batchMode ?? false}
          onCheckedChange={(e) => store.update("batchMode", e)}
        />
      </div>
      <SliderInput
        label="Batch size"
        valueDisplay={store.params.batchCount}
        min={2}
        max={100}
        value={store.params.batchCount ?? 2}
        onChange={(e) => store.update("batchCount", e)}
        disabled={!store.params.batchMode}
      />
    </>
  );
}
