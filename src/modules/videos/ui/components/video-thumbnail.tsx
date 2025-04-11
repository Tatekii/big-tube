import Image from "next/image"

import { formatDuration } from "@/lib/utils"

import { THUMBNAIL_FALLBACK } from "@/constants"
import { Skeleton } from "@/components/ui/skeleton"

interface VideoThumbnailProps {
	title: string
	duration: number
	imageUrl?: string | null
	previewUrl?: string | null
}

export const VideoThumbnailSkeleton = () => {
	return (
		<div className="relative w-full overflow-hidden rounded-xl aspect-video">
			<Skeleton className="size-full" />
		</div>
	)
}

export const VideoThumbnail = ({ title, imageUrl, previewUrl, duration }: VideoThumbnailProps) => {
	return (
		<div className="relative group">
			<div className="relative w-full overflow-hidden rounded-xl aspect-video">
				{/* hover切换静态图片到gif */}
				<Image
					src={imageUrl || THUMBNAIL_FALLBACK}
					alt={title}
					fill
					className="h-full w-full object-cover group-hover:opacity-0"
				/>
				<Image
					unoptimized={!!previewUrl}
					src={previewUrl || THUMBNAIL_FALLBACK}
					alt={title}
					fill
					className="h-full w-full object-cover opacity-0 group-hover:opacity-100"
				/>
			</div>

			{/* 视频时长 */}
			<div className="absolute bottom-2 right-2 px-1 py-0.5 rounded bg-black/80 text-white text-xs font-medium">
				{formatDuration(duration)}
			</div>
		</div>
	)
}
