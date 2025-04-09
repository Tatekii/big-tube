/**
 * // NOTE MUX WEBHOOK 的地址前面要加上https
 */
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { UTApi } from "uploadthing/server"
import {
	VideoAssetCreatedWebhookEvent,
	VideoAssetErroredWebhookEvent,
	VideoAssetReadyWebhookEvent,
	VideoAssetTrackReadyWebhookEvent,
	VideoAssetDeletedWebhookEvent,
} from "@mux/mux-node/resources/webhooks"

import { db } from "@/db"
import { mux } from "@/lib/mux"
import { videos } from "@/db/schema"
import { NextRequest } from "next/server"

const SIGNING_SECRET = process.env.MUX_WEBHOOK_SECRET
const MUX_SIGNATURE_HEADER = "mux-signature"

if (!SIGNING_SECRET) {
	throw new Error("SHORT OF MUX WEBHOOK SECRET!")
}

type WebhookEvent =
	| VideoAssetCreatedWebhookEvent
	| VideoAssetReadyWebhookEvent
	| VideoAssetErroredWebhookEvent
	| VideoAssetTrackReadyWebhookEvent
	| VideoAssetDeletedWebhookEvent

export const POST = async (request: NextRequest) => {
	if (!SIGNING_SECRET) {
		throw new Error("MUX_WEBHOOK_SECRET is not set")
	}

	const headersPayload = await headers()
	const muxSignature = headersPayload.get(MUX_SIGNATURE_HEADER)

	if (!muxSignature) {
		return new Response("No signature found", { status: 401 })
	}

	const payload = await request.json()

	const body = JSON.stringify(payload)

	// Verify webhook signatures
	try {
		mux.webhooks.verifySignature(body, headersPayload, SIGNING_SECRET)
	} catch {
		return new Response("MUX webhook verifySignature failed", { status: 401 })
	}

	switch (payload.type as WebhookEvent["type"]) {
		case "video.asset.created": {
			const data = payload.data as VideoAssetCreatedWebhookEvent["data"]

			if (!data.upload_id) {
				return new Response("No upload ID found", { status: 400 })
			}

			console.log("Creating video: ", { uploadId: data.upload_id })

			await db
				.update(videos)
				.set({
					muxAssetId: data.id,
					muxStatus: data.status,
				})
				.where(eq(videos.muxUploadId, data.upload_id))
			break
		}

		case "video.asset.ready": {
			const data = payload.data as VideoAssetReadyWebhookEvent["data"]
			const playbackId = data.playback_ids?.[0].id

			if (!data.upload_id) {
				return new Response("Missing upload ID", { status: 400 })
			}

			if (!playbackId) {
				return new Response("Missing playback ID", { status: 400 })
			}

			console.log("Ready video: ", { uploadId: data.upload_id })

			const tempThumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`
			const tempPreviewUrl = `https://image.mux.com/${playbackId}/animated.gif`
			const duration = data.duration ? Math.round(data.duration * 1000) : 0

			const utapi = new UTApi()

			const [uploadedThumbnail, uploadedPreview] = await utapi.uploadFilesFromUrl([
				tempThumbnailUrl,
				tempPreviewUrl,
			])

			if (!uploadedThumbnail.data || !uploadedPreview.data) {
				return new Response("Failed to upload thumbnail or preview", { status: 500 })
			}

			const { key: thumbnailKey, url: thumbnailUrl } = uploadedThumbnail.data
			const { key: previewKey, url: previewUrl } = uploadedPreview.data

			await db
				.update(videos)
				.set({
					muxStatus: data.status,
					muxPlaybackId: playbackId,
					muxAssetId: data.id,
					thumbnailUrl,
					thumbnailKey,
					previewUrl,
					previewKey,
					duration,
				})
				.where(eq(videos.muxUploadId, data.upload_id))
			break
		}

		case "video.asset.errored": {
			const data = payload.data as VideoAssetErroredWebhookEvent["data"]

			if (!data.upload_id) {
				return new Response("Missing upload ID", { status: 400 })
			}

			await db
				.update(videos)
				.set({
					muxStatus: data.status,
				})
				.where(eq(videos.muxUploadId, data.upload_id))
			break
		}

		case "video.asset.deleted": {
			const data = payload.data as VideoAssetDeletedWebhookEvent["data"]

			if (!data.upload_id) {
				return new Response("Missing upload ID", { status: 400 })
			}

			console.log("Deleting video: ", { uploadId: data.upload_id })

			await db.delete(videos).where(eq(videos.muxUploadId, data.upload_id))
			break
		}

		// 字幕轨
		case "video.asset.track.ready": {
			const data = payload.data as VideoAssetTrackReadyWebhookEvent["data"] & {
				asset_id: string
			}

			console.log("Track ready")

			const assetId = data.asset_id
			const trackId = data.id
			const status = data.status

			if (!assetId) {
				return new Response("Missing asset ID", { status: 400 })
			}

			await db
				.update(videos)
				.set({
					muxTrackId: trackId,
					muxTrackStatus: status,
				})
				.where(eq(videos.muxAssetId, assetId))
			break
		}
	}

	return new Response("Webhook received", { status: 200 })
}
