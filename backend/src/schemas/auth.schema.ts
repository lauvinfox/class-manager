// schemas/auth.schema.ts
import { z } from "zod";

export const SignUpSchema = z
  .object({
    name: z.string().min(1).max(255),
    email: z.string().email().min(1).max(255),
    username: z.string().min(1),
    password: z.string().min(6).max(255),
    confirmPassword: z.string().min(6).max(255),
    dateOfBirth: z
      .string()
      .refine((value) => !isNaN(new Date(value).getTime()), {
        message: 'Invalid date format, expected "YYYY-MM-DD"',
      }),
    userAgent: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const SignInSchema = z.object({
  email: z.string().email().min(1).max(255),
  password: z.string().min(6).max(255),
  userAgent: z.string().optional(),
});

export const VerificationCodeSchema = z.string().min(1).max(24);

export const ResetPasswordSchema = z.object({
  password: z.string().min(6).max(255),
  verificationCode: VerificationCodeSchema,
});

export type SignUpParams = z.infer<typeof SignUpSchema>;
export type SignInParams = z.infer<typeof SignInSchema>;
