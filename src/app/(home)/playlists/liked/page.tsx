import { DEFAULT_LIMIT } from "@/trpc/constants"
import { HydrateClient, prefetch, trpc } from "@/trpc/server"

import { LikedView } from "@/modules/playlists/ui/views/liked-view"

export const dynamic = "force-dynamic"

const LikedPage = async () => {
	prefetch(trpc.playlists.getLiked.infiniteQueryOptions({ limit: DEFAULT_LIMIT }))

	return (
		<HydrateClient>
			<LikedView />
		</HydrateClient>
	)
}

export default LikedPage
