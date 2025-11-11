import { z } from "zod"

export const sendMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(5000, "Message is too long (max 5000 characters)"),
  conversationId: z.string().uuid("Invalid conversation ID"),
})

export const reportUserSchema = z.object({
  reportedId: z.string().uuid("Invalid user ID"),
  reason: z.enum(["spam", "underage", "harassment", "inappropriate", "other"], {
    required_error: "Please select a reason",
  }),
  details: z.string().max(1000, "Details are too long (max 1000 characters)").optional(),
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>
export type ReportUserInput = z.infer<typeof reportUserSchema>
