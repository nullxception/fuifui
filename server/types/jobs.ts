import z from "zod";

export const jobsTypeSchema = z.literal(["txt2img", "convert"]);

export const jobStatusSchema = z.union([
  z.literal("pending"),
  z.literal("running"),
  z.literal("completed"),
  z.literal("failed"),
  z.literal("cancelled"),
]);

const dbOptional = <T extends z.ZodTypeAny>(schema: T) =>
  schema
    .nullable()
    .transform((v) => v ?? undefined)
    .optional();

export const jobSchema = z.object({
  id: z.string(),
  type: jobsTypeSchema,
  status: jobStatusSchema,
  createdAt: z.number(),
  startedAt: dbOptional(z.number()),
  completedAt: dbOptional(z.number()),
  result: dbOptional(z.string()),
});

export type JobType = z.infer<typeof jobsTypeSchema>;
export type JobStatus = z.infer<typeof jobStatusSchema>;
export type Job = z.infer<typeof jobSchema>;

export interface LogData {
  type: "stdout" | "stderr";
  message: string;
}
