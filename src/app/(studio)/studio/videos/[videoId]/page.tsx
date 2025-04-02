import { HydrateClient, prefetch, trpc } from "@/trpc/server"

import { VideoView } from "@/modules/studio/ui/views/video-view"

export const dynamic = "force-dynamic"

interface PageProps {
	params: Promise<{ videoId: string }>
}

const StudioVideoIdPage = async ({ params }: PageProps) => {

	const { videoId } = await params

	prefetch(trpc.categories.getMany.queryOptions())

	return (
		<HydrateClient>
			<VideoView videoId={videoId} />
		</HydrateClient>
	)
}

export default StudioVideoIdPage
