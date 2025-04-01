import { z } from "zod"
import { eq, getTableColumns, inArray, isNotNull } from "drizzle-orm"

import { db } from "@/db"
import { TRPCError } from "@trpc/server"
import { subscriptions, users, videos } from "@/db/schema"
import { baseProcedure, createTRPCRouter } from "@/trpc/init"

export const usersRouter = createTRPCRouter({
	/**
	 * 查看帐号 无需权限
	 */
	getOne: baseProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ input, ctx }) => {
		const { userId } = ctx

		let targetUserId

		const [user] = await db
			.select()
			.from(users)
			.where(inArray(users.id, userId ? [userId] : []))

		if (user) {
			targetUserId = user.id
		}

		const viewerSubscriptions = db.$with("viewer_subscriptions").as(
			db
				.select()
				.from(subscriptions)
				.where(inArray(subscriptions.viewerId, targetUserId ? [targetUserId] : []))
		)

		const [existingUser] = await db
			.with(viewerSubscriptions)
			.select({
				...getTableColumns(users),
				viewerSubscribed: isNotNull(viewerSubscriptions.viewerId).mapWith(Boolean),
				videoCount: db.$count(videos, eq(videos.userId, users.id)),
				subscriberCount: db.$count(subscriptions, eq(subscriptions.creatorId, users.id)),
			})
			.from(users)
			.leftJoin(viewerSubscriptions, eq(viewerSubscriptions.creatorId, users.id))
			.where(eq(users.id, input.id))

		if (!existingUser) {
			throw new TRPCError({ code: "NOT_FOUND" })
		}

		return existingUser
	}),
})
