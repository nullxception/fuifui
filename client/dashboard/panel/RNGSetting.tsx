import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDiffusionConf } from "@/hooks/useDiffusionConfig";
import { DicesIcon, RotateCcwIcon } from "lucide-react";

export function SeedSetting() {
  const store = useDiffusionConf("seed");
  return (
    <div className="space-y-4">
      <Label htmlFor="seedInput">Seed</Label>
      <InputGroup>
        <InputGroupButton
          type="button"
          onClick={() => store.update(Math.floor(Math.random() * 9999999 + 1))}
          className="mr-2"
          title="Random Seed"
        >
          <DicesIcon />
        </InputGroupButton>
        <InputGroupInput
          id="seedInput"
          type="number"
          value={store.value}
          onChange={(e) => store.update(parseInt(e.target.value))}
          placeholder="-1 for random"
        />
        <InputGroupButton
          type="button"
          onClick={() => store.update(-1)}
          className="mr-2"
          title="Random Seed"
        >
          <RotateCcwIcon />
        </InputGroupButton>
      </InputGroup>
    </div>
  );
}

export function SamplerRngSetting() {
  const store = useDiffusionConf("samplerRng");
  const rngOptions = ["std_default", "cuda", "cpu"];
  return (
    <div className="space-y-4">
      <Label htmlFor="samplerRng">Sampler RNG</Label>
      <Select value={store.value ?? ""} onValueChange={(e) => store.update(e)}>
        <SelectTrigger id="samplerRng" className="w-full">
          <SelectValue placeholder={`Sampler RNG`} />
        </SelectTrigger>
        <SelectContent className="bg-background/80 p-1 backdrop-blur-xs">
          <SelectGroup>
            {rngOptions.map((rng) => (
              <SelectItem key={rng} value={rng}>
                {rng}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export function RNGSetting() {
  const store = useDiffusionConf("rng");
  const rngOptions = ["std_default", "cuda", "cpu"];
  return (
    <div className="space-y-4">
      <Label htmlFor="rngSelect">RNG</Label>
      <Select value={store.value ?? ""} onValueChange={(e) => store.update(e)}>
        <SelectTrigger id="rngSelect" className="w-full">
          <SelectValue placeholder={`RNG`} />
        </SelectTrigger>
        <SelectContent className="bg-background/80 p-1 backdrop-blur-xs">
          <SelectGroup>
            {rngOptions.map((rng) => (
              <SelectItem key={rng} value={rng}>
                {rng}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
