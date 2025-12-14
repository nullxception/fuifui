import z from "zod";
import { diffusionParamsSchema } from "./diffusionparams";
import { promptAttachmentSchema } from "./promptAttachment";

export const appSettingsSchema = z.object({
  background: z.string().optional(),
  maxWidth: z.number(),
  maxHeight: z.number(),
});

export const userConfigSchema = z.object({
  diffusion: diffusionParamsSchema,
  settings: appSettingsSchema,
  promptAttachment: z.array(promptAttachmentSchema),
});

export type AppSettings = z.infer<typeof appSettingsSchema>;
export type UserConfig = z.infer<typeof userConfigSchema>;
