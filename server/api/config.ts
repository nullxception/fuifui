import { promises as fs } from "fs";
import { CONFIG_PATH } from "../dirs";
import type { UserConfig } from "../types";

type Valuable<T> = {
  [K in keyof T as T[K] extends null | undefined ? never : K]: T[K];
};

function getValuable<T extends object, V = Valuable<T>>(obj: T): V {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) =>
        !(
          (typeof v === "string" && !v.length) ||
          v === null ||
          typeof v === "undefined"
        ),
    ),
  ) as V;
}

export async function readConfig() {
  try {
    if (
      await fs
        .access(CONFIG_PATH)
        .then(() => true)
        .catch(() => false)
    ) {
      const file = await Bun.file(CONFIG_PATH).text();
      const config = Bun.YAML.parse(file);
      return Response.json(config);
    } else {
      return Response.json({});
    }
  } catch (error) {
    console.error("Error reading config:", error);
    return Response.json({ error: "Failed to read config" }, { status: 500 });
  }
}

export async function saveConfig(request?: Request) {
  if (!request) throw new Error("Request is required for this endpoint");
  try {
    const body = await request.text();
    const conf: UserConfig = JSON.parse(body);
    conf.diffusion = getValuable(conf.diffusion || {});
    conf.settings = getValuable(conf.settings || {});
    const yml = Bun.YAML.stringify(conf, null, 2);
    await Bun.write(CONFIG_PATH, yml);
    return Response.json({
      success: true,
      message: "Config saved successfully",
    });
  } catch (error) {
    console.error("Error saving config:", error);
    return Response.json(
      {
        error: "Failed to save config",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
