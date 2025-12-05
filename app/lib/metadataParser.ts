import type { Models } from "server/types";

export interface ParsedMetadata {
  prompt: string;
  negativePrompt: string;
  width: number;
  height: number;
  upscaled: boolean;
  baseWidth: number;
  baseHeight: number;
  model: string;
  steps: number;
  cfgScale: number;
  seed: number;
  rng: string;
  samplingMethod: string;
  scheduler: string;
  version: string;
  vae?: string;
  textEncoders?: string[];
}

const emptyMetadata: ParsedMetadata = {
  prompt: "",
  negativePrompt: "",
  width: -1,
  height: -1,
  upscaled: false,
  baseWidth: -1,
  baseHeight: -1,
  model: "",
  steps: -1,
  cfgScale: -1,
  seed: -1,
  rng: "",
  samplingMethod: "",
  scheduler: "",
  version: "",
};

const snakeToCamel = (str: string) =>
  str
    .toLowerCase()
    .replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase().replace("-", "").replace("_", ""),
    );

// --- Split by commas but ignore commas inside parentheses ---
export const splitSmart = (t: string): string[] => {
  const result: string[] = [];
  let current = "";
  let depth = 0;

  for (const char of t) {
    if (char === "(") depth++;
    if (char === ")") depth--;

    if (char === "," && depth === 0) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  if (current.trim()) result.push(current.trim());
  return result;
};

function fixLoraPath(text: string, models?: Models): string {
  if (!models?.loras.length) {
    return text;
  }

  const validLoras = new Set(
    models.loras.map((x) => x.replace(/\.(safetensors|ckpt)$/, "")),
  );

  const loraRegex = /<lora:(.*?):[^>]*>/;
  const match = text.match(loraRegex);

  if (!match) {
    return text;
  }

  const [, currentPath] = match;

  if (currentPath && validLoras.has(currentPath)) {
    return text;
  }

  const filename = currentPath?.split("/").at(-1);

  if (!filename) {
    return text;
  }

  const properPath = models.loras
    .map((x) => x.replace(/\.(safetensors|ckpt)$/, ""))
    .find((validPath) => validPath.endsWith(filename));

  if (properPath) {
    const newTag = `<lora:${properPath}:`;
    return text.replace(/<lora:(.*?):/, newTag);
  }

  return text;
}

export const optimizePrompt = (text: string, models?: Models): string => {
  // --- Normalize whitespace + flatten lines ---
  const parts = text
    .split("\n")
    .flatMap((line) => splitSmart(line))
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  // --- Remove duplicates (case-insensitive) ---
  const seen = new Set<string>();
  const unique = parts.filter((p) => {
    const key = p.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // --- Categorize ---
  const loras: string[] = [];
  const embeds: string[] = [];
  const others: string[] = [];

  for (const p of unique) {
    if (p.startsWith("<lora:")) {
      loras.push(fixLoraPath(p, models));
    } else if (p.includes("embedding:")) {
      embeds.push(p);
    } else {
      others.push(p);
    }
  }

  return [...loras, ...embeds, ...others]
    .join(", ")
    .replace(/(\()\s+|\s+(\))/g, (_, open, close) => open || close);
};

export const parseDiffusionParams = (
  metadata?: Record<string, unknown>,
): ParsedMetadata => {
  if (!metadata) return emptyMetadata;
  const data: ParsedMetadata = Object.create(emptyMetadata);

  // Try to find the parameters string. It's often in 'parameters' or 'UserComment'
  // based on how stable-diffusion.cpp or other tools save it.
  // We check for the string content provided by the user.
  let rawParams = "";
  if (typeof metadata.parameters === "string") {
    rawParams = metadata.parameters;
  } else if (typeof metadata.UserComment === "string") {
    // Sometimes UserComment has a prefix like "UNICODE=" or similar, but often it's just the string
    rawParams = metadata.UserComment;
  } else if (typeof metadata.Description === "string") {
    rawParams = metadata.Description;
  } else {
    // If we can't find a specific key, try to find any string value that looks like parameters
    const potentialValue = Object.values(metadata).find(
      (val) => typeof val === "string" && val.includes("Steps: "),
    ) as string | undefined;
    if (potentialValue) rawParams = potentialValue;
  }

  if (typeof metadata.ImageWidth === "number") {
    data.width = metadata.ImageWidth;
  }
  if (typeof metadata.ImageHeight === "number") {
    data.height = metadata.ImageHeight;
  }

  if (!rawParams) return data;

  try {
    const lines = rawParams.split("\n").filter((l) => l.trim() !== "");
    let prompt = "";
    let negativePrompt = "";
    const otherParams: Record<string, string | number> = {};

    let isNegative = false;
    let isParams = false;

    for (const line of lines) {
      if (line.startsWith("Negative prompt:")) {
        negativePrompt = line.replace("Negative prompt:", "").trim();
        isNegative = true;
        continue;
      }
      if (line.startsWith("Steps: ")) {
        isParams = true;
        isNegative = false; // End of negative prompt section
        const pairs = line.split(", ");
        pairs.forEach((pair) => {
          const [key, ...values] = pair.split(": ");
          if (key && values.length > 0) {
            let k = key.toLowerCase().replace(/ /g, "_").trim();
            k = snakeToCamel(k);
            const v = values.join(": ").trim();
            switch (k) {
              case "version":
                data.version = v;
                break;
              case "model":
              case "unet":
                data.model = v;
                break;
              case "vae":
                data.vae = v;
                break;
              case "te":
                if (data.textEncoders?.includes(v)) {
                  break;
                }
                data.textEncoders = data.textEncoders
                  ? [...data.textEncoders, v]
                  : [v];
                break;
              case "cfgScale":
                data.cfgScale = parseFloat(v);
                break;
              case "steps":
                data.steps = parseInt(v);
                break;
              case "size": {
                const [width, height] = v.split("x").map((d) => d.trim());

                if (width && height) {
                  data.baseWidth = parseInt(width);
                  data.baseHeight = parseInt(height);
                }
                if (
                  data.width > data.baseWidth ||
                  data.height > data.baseHeight
                ) {
                  data.upscaled = true;
                }
                break;
              }
              case "sampler": {
                const [method, sched] = v.split(" ").map((s) => s.trim());
                if (method && sched) {
                  data.samplingMethod = method;
                  data.scheduler = sched;
                }
                break;
              }
              case "rng":
                data.rng = v;
                break;
              case "seed":
                data.seed = Number(v);
                break;
              case "guidance":
              case "eta":
                break; // Ignore for now
              default:
                otherParams[k] = v;
                break;
            }
          }
        });
        continue;
      }

      if (isNegative && !isParams) {
        negativePrompt += (negativePrompt ? "\n" : "") + line;
        continue;
      }

      if (!isNegative && !isParams) {
        prompt += (prompt ? "\n" : "") + line;
      }
    }

    data.prompt = optimizePrompt(prompt.replace(/['"]+/g, ""));
    data.negativePrompt = optimizePrompt(negativePrompt.replace(/['"]+/g, ""));
    return data;
  } catch (e) {
    console.error("Failed to parse parameters", e);
    return data;
  }
};
