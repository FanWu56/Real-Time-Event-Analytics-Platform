import { z } from "zod"

export const eventSchema = z.object({
  eventName: z.string().min(1).max(100),
  userId: z.string().optional(),
  properties: z.record(z.string(), z.unknown()).optional().default({}),
  timestamp: z.iso.datetime().optional(),
})

export type EventInput = z.infer<typeof eventSchema>