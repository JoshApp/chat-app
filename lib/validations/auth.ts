import { z } from "zod"

// Display name validation - non-unique, user's chosen name
const displayNameSchema = z
  .string()
  .min(3, "Display name must be at least 3 characters")
  .max(20, "Display name must be at most 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Display name can only contain letters, numbers, and underscores")

export const guestSignupSchema = z.object({
  username: displayNameSchema, // Will become display_name in the database
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"], {
    required_error: "Please select a gender",
  }),
  age: z
    .number({ required_error: "Please select your age" })
    .int()
    .min(18, "You must be at least 18 years old")
    .max(100, "Please enter a valid age"),
  ageConfirmed: z.literal(true, {
    errorMap: () => ({ message: "You must confirm you are 18 or older" }),
  }),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms of service" }),
  }),
})

export const emailLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const emailSignupSchema = z.object({
  username: displayNameSchema, // Will become display_name in the database
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"], {
    required_error: "Please select a gender",
  }),
  age: z
    .number({ required_error: "Please select your age" })
    .int()
    .min(18, "You must be at least 18 years old")
    .max(100, "Please enter a valid age"),
  ageConfirmed: z.literal(true, {
    errorMap: () => ({ message: "You must confirm you are 18 or older" }),
  }),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms of service" }),
  }),
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
