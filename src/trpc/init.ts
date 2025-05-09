import { db } from "@/db"
import { eq } from "drizzle-orm"
import { users } from "@/db/schema"
import { initTRPC, TRPCError } from "@trpc/server"
import { cache } from "react"
import superjson from "superjson"
import { ratelimit } from "@/lib/rateLimit"
// import * as trpcNext from "@trpc/server/adapters/next"
import { getAuthUser } from "@/modules/auth/utils"

export const createTRPCContext = cache(async () => {
	// export const createTRPCContext = cache(async ({ req }: trpcNext.CreateNextContextOptions) => {
	const userId = await getAuthUser()

	return { userId }
})

export type Context = Awaited<ReturnType<typeof createTRPCContext>>

const t = initTRPC.context<Context>().create({
	/**
	 * @see https://trpc.io/docs/server/data-transformers
	 */
	transformer: superjson,
})

// Base router and procedure helpers
export const createTRPCRouter = t.router
export const createCallerFactory = t.createCallerFactory

export const baseProcedure = t.procedure

export const protectedProcedure = t.procedure.use(async function isAuthed({ ctx, next }) {
	if (!ctx.userId) {
		// NOTE
		Reflect.deleteProperty(ctx, "user")

		console.log("[[protectedProcedure]]", "UNAUTHORIZED")

		throw new TRPCError({ code: "UNAUTHORIZED" })
	}

	const [user] = await db
		.select({
			id: users.id,
			email: users.email,
			firstName: users.firstName,
			lastName: users.lastName,
			name: users.name,
			createdAt: users.createdAt,
			imageUrl: users.imageUrl,
		})
		.from(users)
		.where(eq(users.id, ctx.userId))
		.limit(1)

	if (!user) {
		throw new TRPCError({ code: "UNAUTHORIZED" })
	}

	const { success } = await ratelimit.limit(user.id)

	if (!success) {
		throw new TRPCError({ code: "TOO_MANY_REQUESTS" })
	}

	return next({
		ctx: {
			...ctx,
			userId: ctx.userId,
			user,
		},
	})
})
