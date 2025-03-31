"server-only"

import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init"
import { TRPCError } from "@trpc/server"
import { loginSchema, registerSchema } from "../schema"
import { db } from "@/db"
import { users } from "@/db/schema"
import { redirect } from "next/navigation"

export const authRouter = createTRPCRouter({
	current: protectedProcedure.query(async ({ ctx }) => {
		return { data: ctx.user }
	}),

	login: baseProcedure.input(loginSchema).mutation(async ({ input, ctx }) => {
		const { email, password } = input
		// TODO

		try {
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

	register: baseProcedure.input(registerSchema).mutation(async ({ input, ctx }) => {
		const { email, password, lastName, firstName } = input

		// TODO

		try {
			// TODO

			// await cookies().set(ctx, AUTH_COOKIE, session.secret, {
			// 	path: "/",
			// 	httpOnly: true,
			// 	secure: true,
			// 	sameSite: "strict",
			// 	maxAge: 60 * 60 * 24 * 30,
			// })

			// await setAuthCookie(user.id)

			return {
				success: true,
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
			// await ctx.account.deleteSession("current")

			return { success: true }
		} catch {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Logout failed",
			})
		}
	}),
})
