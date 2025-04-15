import { HydrateClient, prefetch, trpc } from "@/trpc/server"

import { VideosView } from "@/modules/playlists/ui/views/videos-view"
import { DEFAULT_LIMIT } from "@/trpc/constants"

export const dynamic = "force-dynamic"

interface PageProps {
	params: Promise<{ playlistId: string }>
}

const PlaylistIdPage = async ({ params }: PageProps) => {
	const { playlistId } = await params

	prefetch(trpc.playlists.getOne.queryOptions({ id: playlistId }))

	prefetch(trpc.playlists.getVideos.infiniteQueryOptions({ playlistId, limit: DEFAULT_LIMIT }))

	return (
		<HydrateClient>
			<VideosView playlistId={playlistId} />
		</HydrateClient>
	)
}

export default PlaylistIdPage
