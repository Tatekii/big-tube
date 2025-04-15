import { z } from "zod"
import { eq, and } from "drizzle-orm"
import { UploadThingError, UTApi } from "uploadthing/server"
import { createUploadthing, type FileRouter } from "uploadthing/next"

import { db } from "@/db"
import { users, videos } from "@/db/schema"
import { getAuthUser } from "@/modules/auth/utils"

const f = createUploadthing()

export const ourFileRouter = {
	bannerUploader: f({
		image: {
			maxFileSize: "4MB",
			maxFileCount: 1,
		},
	})
		.middleware(async () => {
			const userId = await getAuthUser()

			if (!userId) throw new UploadThingError("Unauthorized")

			const [existingUser] = await db.select().from(users).where(eq(users.id, userId))

			if (!existingUser) throw new UploadThingError("Unauthorized")

			if (existingUser.bannerKey) {
				const utapi = new UTApi()

				await utapi.deleteFiles(existingUser.bannerKey)

				await db
					.update(users)
					.set({ bannerKey: null, bannerUrl: null })
					.where(and(eq(users.id, existingUser.id)))
			}

			return { userId: existingUser.id }
		})
		.onUploadComplete(async ({ metadata, file }) => {
			await db
				.update(users)
				.set({
					bannerUrl: file.ufsUrl,
					bannerKey: file.key,
				})
				.where(eq(users.id, metadata.userId))

			return { uploadedBy: metadata.userId }
		}),

	thumbnailUploader: f({
		image: {
			maxFileSize: "4MB",
			maxFileCount: 1,
		},
	})
		.input(
			z.object({
				videoId: z.string().uuid(),
			})
		)
		.middleware(async ({ input }) => {
			const userId = await getAuthUser()

			if (!userId) throw new UploadThingError("Unauthorized")

			const [user] = await db.select().from(users).where(eq(users.id, userId))

			if (!user) throw new UploadThingError("Unauthorized")

			const [existingVideo] = await db
				.select({
					thumbnailKey: videos.thumbnailKey,
				})
				.from(videos)
				.where(and(eq(videos.id, input.videoId), eq(videos.userId, user.id)))

			if (!existingVideo) throw new UploadThingError("Not found")

			if (existingVideo.thumbnailKey) {
				const utapi = new UTApi()

				await utapi.deleteFiles(existingVideo.thumbnailKey)
				await db
					.update(videos)
					.set({ thumbnailKey: null, thumbnailUrl: null })
					.where(and(eq(videos.id, input.videoId), eq(videos.userId, user.id)))
			}

			return { user, ...input }
		})
		.onUploadComplete(async ({ metadata, file }) => {
			await db
				.update(videos)
				.set({
					thumbnailUrl: file.ufsUrl,
					thumbnailKey: file.key,
				})
				.where(and(eq(videos.id, metadata.videoId), eq(videos.userId, metadata.user.id)))

			return { uploadedBy: metadata.user.id }
		}),

	avatarUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
		.middleware(async () => {
			const userId = await getAuthUser()

			if (!userId) throw new Error("Unauthorized")

			const [user] = await db.select().from(users).where(eq(users.id, userId))

			if (!user) throw new UploadThingError("Unauthorized")

			const utapi = new UTApi()

			if (user.imageUrl) {
				await utapi.deleteFiles(user.imageUrl)
				await db.update(users).set({ imageUrl: null }).where(eq(users.id, userId))
			}

			return { user }
		})
		.onUploadComplete(async ({ metadata, file }) => {
			await db
				.update(users)
				.set({
					imageUrl: file.ufsUrl,
				})
				.where(eq(users.id, metadata.user.id))

			return { uploadedBy: metadata.user.id }
		}),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
