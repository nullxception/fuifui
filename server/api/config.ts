import { promises as fs } from "fs";
import { CONFIG_PATH } from "../constants";
import type { UserConfig } from "../types";

export const readConf = async () => {
  try {
    if (
      await fs
        .access(CONFIG_PATH)
        .then(() => true)
        .catch(() => false)
    ) {
      const file = await Bun.file(CONFIG_PATH).text();
      const config = Bun.YAML.parse(file);
      return config;
    } else {
      return {};
    }
  } catch (error) {
    console.error("Error reading config:", error);
    throw new Error("Failed to read config");
  }
};

type Valuable<T> = {
  [K in keyof T as T[K] extends null | undefined ? never : K]: T[K];
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
function getValuable<T extends {}, V = Valuable<T>>(obj: T): V {
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

export const saveConf = async (body: string) => {
  try {
    const conf: UserConfig = JSON.parse(body);
    conf.diffusion = getValuable(conf.diffusion || {});
    conf.settings = getValuable(conf.settings || {});
    const yml = Bun.YAML.stringify(conf, null, 2);
    await Bun.write(CONFIG_PATH, yml);
    return {
      success: true,
      message: "Config saved successfully",
    };
  } catch (error) {
    console.error("Error saving config:", error);
    throw new Error(
      `Failed to save config: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const readConfig = async () => {
  try {
    const config = await readConf();
    return Response.json(config);
  } catch (error) {
    console.error("Error reading config:", error);
    return Response.json({ error: "Failed to read config" }, { status: 500 });
  }
};

export const saveConfig = async (request?: Request) => {
  if (!request) throw new Error("Request is required for this endpoint");
  try {
    const body = await request.text();
    const result = await saveConf(body);
    return Response.json(result);
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
};
