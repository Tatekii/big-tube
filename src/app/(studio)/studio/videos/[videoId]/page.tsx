import { HydrateClient, prefetch, trpc } from "@/trpc/server"

import { StudioVideoView } from "@/modules/studio/ui/views/video-view"

export const dynamic = "force-dynamic"

interface StudioVideoPageProps {
	params: Promise<{ videoId: string }>
}

const StudioVideoPage = async ({ params }: StudioVideoPageProps) => {
	const { videoId } = await params

	prefetch(
		trpc.studio.getOne.queryOptions({
			id: videoId,
		})
	)

	prefetch(trpc.categories.getMany.queryOptions())

	return (
		<HydrateClient>
			<StudioVideoView videoId={videoId} />
		</HydrateClient>
	)
}

export default StudioVideoPage
