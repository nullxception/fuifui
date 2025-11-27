export interface ParsedMetadata {
  prompt: string;
  negativePrompt: string;
  otherParams: Record<string, string | number>;
}
const emptyMetadata: ParsedMetadata = {
  prompt: "",
  negativePrompt: "",
  otherParams: {},
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

export const optimizePrompt = (text: string): string => {
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
    if (p.startsWith("<lora:")) loras.push(p);
    else if (p.includes("embedding:")) embeds.push(p);
    else others.push(p);
  }

  return [...loras, ...embeds, ...others].join(", ");
};

export const parseDiffusionParams = (
  metadata: Record<string, unknown>,
): ParsedMetadata => {
  if (!metadata) return emptyMetadata;

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

  if (!rawParams) return emptyMetadata;

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
              case "cfgScale":
                otherParams["cfgScale"] = parseFloat(v);
                break;
              case "steps":
                otherParams["steps"] = parseInt(v);
                break;
              case "size": {
                const [width, height] = v.split("x").map((d) => d.trim());
                if (width && height) {
                  otherParams["width"] = parseInt(width);
                  otherParams["height"] = parseInt(height);
                }
                break;
              }
              case "sampler": {
                const [method, sched] = v.split(" ").map((s) => s.trim());
                if (method && sched) {
                  otherParams["samplingMethod"] = method;
                  otherParams["scheduler"] = sched;
                }
                break;
              }
              case "rng":
                otherParams["rng"] = v;
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

    prompt = prompt.replace(/['"]+/g, "");
    negativePrompt = negativePrompt.replace(/['"]+/g, "");
    return {
      prompt: optimizePrompt(prompt),
      negativePrompt: optimizePrompt(negativePrompt),
      otherParams,
    };
  } catch (e) {
    console.error("Failed to parse parameters", e);
    return emptyMetadata;
  }
};
