"server-only"

import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init"
import { TRPCError } from "@trpc/server"
import { loginSchema, registerSchema } from "../schema"

import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { comparePasswords, hashPassword, removeAuthCookie, setAuthCookie } from "../utils"
import { db } from "@/db"

export const authRouter = createTRPCRouter({
	current: protectedProcedure.query(async ({ ctx }) => {
		const user = await db.query.users.findFirst({
			where: eq(users.id, ctx.user.id),
			columns: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
			},
		})

		if (!user) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "User not found",
			})
		}

		return { data: user }
	}),

	login: baseProcedure.input(loginSchema).mutation(async ({ input }) => {
		const { email, password } = input

		try {
			const user = await db.query.users.findFirst({
				where: eq(users.email, email),
			})

			if (!user) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "User not found",
				})
			}

			const isValidPassword = await comparePasswords(password, user.password)

			if (!isValidPassword) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Invalid credentials",
				})
			}

			await setAuthCookie(user.id)

			return {
				success: true,
			}
		} catch {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "Invalid credentials",
			})
		}
	}),

	register: baseProcedure.input(registerSchema).mutation(async ({ input }) => {
		const { email, password, lastName, firstName } = input

		try {
			const existingUser = await db.query.users.findFirst({
				where: eq(users.email, email),
			})

			if (existingUser) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "User already exists",
				})
			}

			const hashedPassword = await hashPassword(password)

			const [user] = await db
				.insert(users)
				.values({
					email,
					password: hashedPassword,
					firstName,
					lastName
				})
				.returning()

			await setAuthCookie(user.id)

			return {
				success: true,
				user: {
					id: user.id,
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName,
				},
			}
		} catch {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Registration failed",
			})
		}
	}),

	logout: protectedProcedure.mutation(async () => {
		try {
			await removeAuthCookie()
			return { success: true }
		} catch {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Logout failed",
			})
		}
	}),
})
