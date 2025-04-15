import { HydrateClient, prefetch, trpc } from "@/trpc/server"

import { PlaylistsView } from "@/modules/playlists/ui/views/playlists-view"
import { DEFAULT_LIMIT } from "@/trpc/constants"

export const dynamic = "force-dynamic"

const PlaylistPage = async () => {
	prefetch(trpc.playlists.getMany.infiniteQueryOptions({ limit: DEFAULT_LIMIT }))

	return (
		<HydrateClient>
			<PlaylistsView />
		</HydrateClient>
	)
}

export default PlaylistPage
