import { SliderInput } from "@/components/SliderInput";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useDiffusionConf } from "@/hooks/useDiffusionConfig";
import { useTRPC } from "@/lib/query";
import { useQuery } from "@tanstack/react-query";
import z from "zod";

export function UpscaleIteration({ disabled }: { disabled: boolean }) {
  const store = useDiffusionConf("upscaleRepeats");
  return (
    <SliderInput
      label={`Upscale iteration`}
      min={1}
      max={5}
      step={1}
      value={store.value ?? 2}
      onChange={(e) => store.update(e)}
      disabled={disabled}
    />
  );
}

export function UpscaleTileSize({ disabled }: { disabled: boolean }) {
  const store = useDiffusionConf("upscaleTileSize");
  return (
    <>
      <div className="flex items-center justify-between py-2">
        <Label htmlFor="upscaleTileSizeSwitch">
          Override upscaler tile size
        </Label>
        <Switch
          id="upscaleTileSizeSwitch"
          checked={store.value !== undefined}
          onCheckedChange={(e) => (e ? store.update(128) : store.unset())}
          disabled={disabled}
        />
      </div>

      <SliderInput
        label={`Upscaler Tile Size`}
        min={64}
        max={1024}
        step={64}
        value={store.value ?? 128}
        onChange={(e) => store.update(e)}
        disabled={store.value === undefined}
      />
    </>
  );
}

export function UpscalerSetting() {
  const store = useDiffusionConf("upscaleModel");
  const rpc = useTRPC();
  const { data: models } = useQuery(rpc.info.models.queryOptions());
  const enabled = z.string().min(1).safeParse(store.value).success;
  return (
    <>
      <div className="space-y-2 pt-2">
        <Label htmlFor="upscaleModelSelect">Upscaler</Label>
        <Select
          value={store.value ?? ""}
          onValueChange={(e) => {
            if (e === "unset") {
              store.unset();
              return;
            }
            store.update(e);
          }}
        >
          <SelectTrigger id="upscaleModelSelect" className="w-full">
            <SelectValue placeholder="Select Upscaler" />
          </SelectTrigger>
          <SelectContent className="bg-background/80 p-1 backdrop-blur-xs">
            <SelectGroup>
              <SelectItem value="unset">unset</SelectItem>
              {models?.upscalers.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <UpscaleIteration disabled={!enabled} />
      <UpscaleTileSize disabled={!enabled} />
    </>
  );
}
