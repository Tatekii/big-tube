import { db } from "@/db"
import { mux } from "@/lib/mux"
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init"
import { subscriptions, users, videoReactions, videos, videoUpdateSchema, videoViews } from "@/db/schema"
import { TRPCError } from "@trpc/server"
import { and, desc, eq, getTableColumns, inArray, isNotNull, lt, or } from "drizzle-orm"
import { z } from "zod"
import { UTApi } from "uploadthing/server"

export const videosRouter = createTRPCRouter({
	create: protectedProcedure.mutation(async ({ ctx }) => {
		const { userId } = ctx

		const upload = await mux.video.uploads.create({
			new_asset_settings: {
				passthrough: userId,
				playback_policy: ["public"],
				input: [
					{
						generated_subtitles: [
							{
								language_code: "en",
								name: "English",
							},
						],
					},
				],
			},
			cors_origin: "*", // TODO: In production, set to your url
		})

		const [video] = await db
			.insert(videos)
			.values({
				userId,
				title: "Untitled",
				muxStatus: "waiting",
				muxUploadId: upload.id,
			})
			.returning()

		return {
			video,
			muxUrl: upload.url,
		}
	}),
	remove: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
		const { id: userId } = ctx.user

		const [removedVideo] = await db
			.delete(videos)
			.where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
			.returning()

		if (!removedVideo) {
			throw new TRPCError({ code: "NOT_FOUND" })
		}

		return removedVideo
	}),
	update: protectedProcedure.input(videoUpdateSchema).mutation(async ({ ctx, input }) => {
		const { id: userId } = ctx.user

		if (!input.id) {
			throw new TRPCError({ code: "BAD_REQUEST" })
		}

		const [updatedVideo] = await db
			.update(videos)
			.set({
				title: input.title,
				description: input.description,
				categoryId: input.categoryId,
				visibility: input.visibility,
				updatedAt: new Date(),
			})
			.where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
			.returning()

		if (!updatedVideo) {
			throw new TRPCError({ code: "NOT_FOUND" })
		}

		return updatedVideo
	}),

	/**
	 * 重置封面
	 */
	restoreThumbnail: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
		const { id: userId } = ctx.user

		const [existingVideo] = await db
			.select()
			.from(videos)
			.where(and(eq(videos.id, input.id), eq(videos.userId, userId)))

		if (!existingVideo) {
			throw new TRPCError({ code: "NOT_FOUND" })
		}

		if (existingVideo.thumbnailKey) {
			// 删除uploadthing的中封面
			const utapi = new UTApi()

			await utapi.deleteFiles(existingVideo.thumbnailKey)
			await db
				.update(videos)
				.set({ thumbnailKey: null, thumbnailUrl: null })
				.where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
		}

		if (!existingVideo.muxPlaybackId) {
			throw new TRPCError({ code: "BAD_REQUEST" })
		}

		// 恢复为mux默认封面
		const utapi = new UTApi()

		const tempThumbnailUrl = `https://image.mux.com/${existingVideo.muxPlaybackId}/thumbnail.jpg`
		const uploadedThumbnail = await utapi.uploadFilesFromUrl(tempThumbnailUrl)

		if (!uploadedThumbnail.data) {
			throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
		}

		const { key: thumbnailKey, url: thumbnailUrl } = uploadedThumbnail.data

		const [updatedVideo] = await db
			.update(videos)
			.set({ thumbnailUrl, thumbnailKey })
			.where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
			.returning()

		return updatedVideo
	}),
	// 获取单个视频
	getOne: baseProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ input, ctx }) => {
		// 可能未登陆
		const { userId } = ctx

		let _userId

		const [user] = await db
			.select()
			.from(users)
			.where(inArray(users.id, _userId ? [_userId] : []))

		if (user) {
			_userId = user.id
		}

		const viewerReactions = db.$with("viewer_reactions").as(
			db
				.select({
					videoId: videoReactions.videoId,
					type: videoReactions.type,
				})
				.from(videoReactions)
				.where(inArray(videoReactions.userId, userId ? [userId] : []))
		)

		const viewerSubscriptions = db.$with("viewer_subscriptions").as(
			db
				.select()
				.from(subscriptions)
				.where(inArray(subscriptions.viewerId, userId ? [userId] : []))
		)

		const [existingVideo] = await db
			.with(viewerReactions, viewerSubscriptions)
			.select({
				...getTableColumns(videos),
				user: {
					...getTableColumns(users),
					subscriberCount: db.$count(subscriptions, eq(subscriptions.creatorId, users.id)),
					viewerSubscribed: isNotNull(viewerSubscriptions.viewerId).mapWith(Boolean),
				},
				viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
				likeCount: db.$count(
					videoReactions,
					and(eq(videoReactions.videoId, videos.id), eq(videoReactions.type, "like"))
				),
				dislikeCount: db.$count(
					videoReactions,
					and(eq(videoReactions.videoId, videos.id), eq(videoReactions.type, "dislike"))
				),
				viewerReaction: viewerReactions.type,
			})
			.from(videos)
			.innerJoin(users, eq(videos.userId, users.id))
			.leftJoin(viewerReactions, eq(viewerReactions.videoId, videos.id))
			.leftJoin(viewerSubscriptions, eq(viewerSubscriptions.creatorId, users.id))
			.where(eq(videos.id, input.id))

		if (!existingVideo) {
			throw new TRPCError({ code: "NOT_FOUND" })
		}

		return existingVideo
	}),

	// 获取全部视频
	getMany: baseProcedure
		.input(
			z.object({
				categoryId: z.string().uuid().nullish(),
				userId: z.string().uuid().nullish(),
				cursor: z
					.object({
						id: z.string().uuid(),
						updatedAt: z.date(),
					})
					.nullish(),
				limit: z.number().min(1).max(100),
			})
		)
		.query(async ({ input }) => {
			const { cursor, limit, categoryId, userId } = input

			const data = await db
				.select({
					...getTableColumns(videos),
					user: users,
					viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
					likeCount: db.$count(
						videoReactions,
						and(eq(videoReactions.videoId, videos.id), eq(videoReactions.type, "like"))
					),
					dislikeCount: db.$count(
						videoReactions,
						and(eq(videoReactions.videoId, videos.id), eq(videoReactions.type, "dislike"))
					),
				})
				.from(videos)
				.innerJoin(users, eq(videos.userId, users.id))
				.where(
					and(
						eq(videos.visibility, "public"),
						userId ? eq(videos.userId, userId) : undefined,
						categoryId ? eq(videos.categoryId, categoryId) : undefined,
						cursor
							? or(
									lt(videos.updatedAt, cursor.updatedAt),
									and(eq(videos.updatedAt, cursor.updatedAt), lt(videos.id, cursor.id))
							  )
							: undefined
					)
				)
				.orderBy(desc(videos.updatedAt), desc(videos.id))
				// Add 1 to the limit to check if there is more data
				.limit(limit + 1)

			const hasMore = data.length > limit
			// Remove the last item if there is more data
			const items = hasMore ? data.slice(0, -1) : data
			// Set the next cursor to the last item if there is more data
			const lastItem = items[items.length - 1]
			const nextCursor = hasMore
				? {
						id: lastItem.id,
						updatedAt: lastItem.updatedAt,
				  }
				: null

			return {
				items,
				nextCursor,
			}
		}),

	// 获取订阅视频
	getManySubscribed: protectedProcedure
		.input(
			z.object({
				cursor: z
					.object({
						id: z.string().uuid(),
						updatedAt: z.date(),
					})
					.nullish(),
				limit: z.number().min(1).max(100),
			})
		)
		.query(async ({ input, ctx }) => {
			const { id: userId } = ctx.user
			const { cursor, limit } = input

			const viewerSubscriptions = db.$with("viewer_subscriptions").as(
				db
					.select({
						userId: subscriptions.creatorId,
					})
					.from(subscriptions)
					.where(eq(subscriptions.viewerId, userId))
			)

			const data = await db
				.with(viewerSubscriptions)
				.select({
					...getTableColumns(videos),
					user: users,
					viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
					likeCount: db.$count(
						videoReactions,
						and(eq(videoReactions.videoId, videos.id), eq(videoReactions.type, "like"))
					),
					dislikeCount: db.$count(
						videoReactions,
						and(eq(videoReactions.videoId, videos.id), eq(videoReactions.type, "dislike"))
					),
				})
				.from(videos)
				.innerJoin(users, eq(videos.userId, users.id))
				.innerJoin(viewerSubscriptions, eq(viewerSubscriptions.userId, users.id))
				.where(
					and(
						eq(videos.visibility, "public"),
						cursor
							? or(
									lt(videos.updatedAt, cursor.updatedAt),
									and(eq(videos.updatedAt, cursor.updatedAt), lt(videos.id, cursor.id))
							  )
							: undefined
					)
				)
				.orderBy(desc(videos.updatedAt), desc(videos.id))
				// Add 1 to the limit to check if there is more data
				.limit(limit + 1)

			const hasMore = data.length > limit
			// Remove the last item if there is more data
			const items = hasMore ? data.slice(0, -1) : data
			// Set the next cursor to the last item if there is more data
			const lastItem = items[items.length - 1]
			const nextCursor = hasMore
				? {
						id: lastItem.id,
						updatedAt: lastItem.updatedAt,
				  }
				: null

			return {
				items,
				nextCursor,
			}
		}),
	// 获取流行视频
	getManyTrending: baseProcedure
		.input(
			z.object({
				cursor: z
					.object({
						id: z.string().uuid(),
						viewCount: z.number(),
					})
					.nullish(),
				limit: z.number().min(1).max(100),
			})
		)
		.query(async ({ input }) => {
			const { cursor, limit } = input

			const viewCountSubquery = db.$count(videoViews, eq(videoViews.videoId, videos.id))

			const data = await db
				.select({
					...getTableColumns(videos),
					user: users,
					viewCount: viewCountSubquery,
					likeCount: db.$count(
						videoReactions,
						and(eq(videoReactions.videoId, videos.id), eq(videoReactions.type, "like"))
					),
					dislikeCount: db.$count(
						videoReactions,
						and(eq(videoReactions.videoId, videos.id), eq(videoReactions.type, "dislike"))
					),
				})
				.from(videos)
				.innerJoin(users, eq(videos.userId, users.id))
				.where(
					and(
						eq(videos.visibility, "public"),
						cursor
							? or(
									lt(viewCountSubquery, cursor.viewCount),
									and(eq(viewCountSubquery, cursor.viewCount), lt(videos.id, cursor.id))
							  )
							: undefined
					)
				)
				.orderBy(desc(viewCountSubquery), desc(videos.id))
				// Add 1 to the limit to check if there is more data
				.limit(limit + 1)

			const hasMore = data.length > limit
			// Remove the last item if there is more data
			const items = hasMore ? data.slice(0, -1) : data
			// Set the next cursor to the last item if there is more data
			const lastItem = items[items.length - 1]
			const nextCursor = hasMore
				? {
						id: lastItem.id,
						viewCount: lastItem.viewCount,
				  }
				: null

			return {
				items,
				nextCursor,
			}
		}),
})
