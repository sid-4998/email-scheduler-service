import { z } from "zod";

export const singleEmailSchema = z.object({
  senderId: z.uuid(),

  to: z.email(),
        
  subject: z.string().min(1, "Subject is required"),

  body: z.string().min(1, "Email body is required"),

  scheduledFor: z.coerce.date().refine(
    (date) => date.getTime() > Date.now(),
    "Scheduled time must be in the future"
  ),

  hourlyLimit: z.number().int().min(1).max(10_000).optional(),

  delayBetweenMs: z.number().int().min(2).max(60_000),

  idempotencyKey: z.string().min(10),
});

export const bulkScheduleEmailSchema = z.object({
  emails: z.array(singleEmailSchema).min(1).max(100),
});