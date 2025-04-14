import { VideoView } from "@/modules/videos/ui/views/video-view"
import { DEFAULT_LIMIT } from "@/trpc/constants"
import { HydrateClient, prefetch, trpc } from "@/trpc/server"

export const dynamic = "force-dynamic"

interface PageProps {
	params: Promise<{
		videoId: string
	}>
}

const Page = async ({ params }: PageProps) => {
	const { videoId } = await params

	prefetch(trpc.comments.getMany.infiniteQueryOptions({ videoId, limit: DEFAULT_LIMIT }))

	prefetch(trpc.videos.getOne.queryOptions({ id: videoId }))

	prefetch(
		trpc.suggestions.getMany.infiniteQueryOptions({
			videoId,
			limit: DEFAULT_LIMIT,
		})
	)

	return (
		<HydrateClient>
			<VideoView videoId={videoId} />
		</HydrateClient>
	)
}

export default Page
