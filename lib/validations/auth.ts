import { z } from "zod"

// Display name validation - non-unique, user's chosen name
const displayNameSchema = z
  .string()
  .min(3, "Display name must be at least 3 characters")
  .max(20, "Display name must be at most 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Display name can only contain letters, numbers, and underscores")

// Vibe validation
const vibeSchema = z.enum(["soft", "flirty", "spicy", "intense"])

// Interest tags validation
const interestTagsSchema = z.array(z.string()).max(3, "You can select up to 3 interests")

// Status line validation
const statusLineSchema = z
  .string()
  .max(100, "Status must be at most 100 characters")
  .optional()

export const guestSignupSchema = z.object({
  username: displayNameSchema, // Will become display_name in the database
  age: z
    .number()
    .int()
    .min(18, "You must be at least 18 years old")
    .max(100, "Please enter a valid age"),
  vibe: vibeSchema,
  interests: interestTagsSchema.optional(),
  statusLine: statusLineSchema,
  ageConfirmed: z.literal(true),
  termsAccepted: z.literal(true),
})

export const emailLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const emailSignupSchema = z.object({
  username: displayNameSchema, // Will become display_name in the database
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  age: z
    .number()
    .int()
    .min(18, "You must be at least 18 years old")
    .max(100, "Please enter a valid age"),
  vibe: vibeSchema,
  interests: interestTagsSchema.optional(),
  statusLine: statusLineSchema,
  ageConfirmed: z.literal(true),
  termsAccepted: z.literal(true),
})

export const upgradeAccountSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const updateDisplayNameSchema = z.object({
  displayName: displayNameSchema,
})

export type GuestSignupInput = z.infer<typeof guestSignupSchema>
export type EmailLoginInput = z.infer<typeof emailLoginSchema>
export type EmailSignupInput = z.infer<typeof emailSignupSchema>
export type UpgradeAccountInput = z.infer<typeof upgradeAccountSchema>
export type UpdateDisplayNameInput = z.infer<typeof updateDisplayNameSchema>
