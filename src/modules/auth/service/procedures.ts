"server-only"

import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init"
import { TRPCError } from "@trpc/server"
import { loginSchema, registerSchema, updateUserSchema } from "../schema"

import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { comparePasswords, hashPassword, removeAuthCookie, setAuthCookie } from "../utils"
import { db } from "@/db"

export const authRouter = createTRPCRouter({
	current: protectedProcedure.query(async ({ ctx }) => {
		// const user = await db.query.users.findFirst({
		// 	where: eq(users.id, ctx.user.id),
		// 	columns: {
		// 		id: true,
		// 		email: true,
		// 		firstName: true,
		// 		lastName: true,
		// 	},
		// })

		const { user } = ctx

		// NOTE drop id in server
		const { id, ...userInfo } = user

		// if (!user || !userId) {
		// 	// 自动登出
		// 	await removeAuthCookie()
		// 	ctx.user = null
		// 	ctx.userId = null

		// 	throw new TRPCError({
		// 		code: "NOT_FOUND",
		// 		message: "User not found",
		// 	})
		// }

		return { data: userInfo }
	}),

	login: baseProcedure.input(loginSchema).mutation(async ({ input }) => {
		const { email, password } = input

		try {
			const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)

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
			const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1)

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
					lastName,
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

	logout: protectedProcedure.mutation(async ({ ctx }) => {
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

	update: protectedProcedure.input(updateUserSchema).mutation(async ({ input, ctx }) => {
		try {
			// If updating password, hash it
			const updateData = input.password ? { ...input, password: await hashPassword(input.password) } : input

			const [updatedUser] = await db.update(users).set(updateData).where(eq(users.id, ctx.user.id)).returning({
				id: users.id,
				email: users.email,
				firstName: users.firstName,
				lastName: users.lastName,
			})

			if (!updatedUser) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "User not found",
				})
			}

			return {
				success: true,
				user: updatedUser,
			}
		} catch {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Failed to update user",
			})
		}
	}),

	// TODO delete user
	delete: protectedProcedure.mutation(async ({ ctx }) => {
		try {
			// Delete the user
			const [deletedUser] = await db.delete(users).where(eq(users.id, ctx.user.id)).returning({ id: users.id })

			if (!deletedUser) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "User not found",
				})
			}

			// Remove auth cookie
			await removeAuthCookie()

			return {
				success: true,
			}
		} catch {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Failed to delete user",
			})
		}
	}),
})
