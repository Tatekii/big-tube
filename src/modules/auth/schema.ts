import { z } from "zod"

export const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1),
})

export const registerSchema = z
	.object({
		firstName: z.string().trim().min(1),
		lastName: z.string().trim().min(1),
		email: z.string().email(),
		password: z.string().min(8),
		password2: z.string().min(8)
	})
	.superRefine((val, ctx) => {
		if (val.password2 !== val.password) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "两次输入的密码不一致",
				path: ["password2"],
			})
		}
	})// Add update schema
export const updateUserSchema = z.object({
	firstName: z.string().min(1).optional(),
	lastName: z.string().min(1).optional(),
	email: z.string().email().optional(),
	password: z.string().min(6).optional(),
})

