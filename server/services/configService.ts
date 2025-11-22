import { promises as fs } from "fs";
import * as yaml from "js-yaml";
import { CONFIG_PATH } from "../config/constants";

export const readConfig = async () => {
  try {
    if (
      await fs
        .access(CONFIG_PATH)
        .then(() => true)
        .catch(() => false)
    ) {
      const configContent = await fs.readFile(CONFIG_PATH, "utf8");
      const config = yaml.load(configContent);
      return config;
    } else {
      return {};
    }
  } catch (error) {
    console.error("Error reading config:", error);
    throw new Error("Failed to read config");
  }
};

export const saveConfig = async (body: string) => {
  try {
    // Validate YAML syntax
    yaml.load(body);

    // Write to config file
    await fs.writeFile(CONFIG_PATH, body, "utf8");
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
