import { DEFAULT_LIMIT } from "@/trpc/constants"
import { HydrateClient, prefetch, trpc } from "@/trpc/server"

import { HistoryView } from "@/modules/playlists/ui/views/history-view"

export const dynamic = "force-dynamic"

const HistoryPage = async () => {
	prefetch(trpc.playlists.getHistory.infiniteQueryOptions({ limit: DEFAULT_LIMIT }))

	return (
		<HydrateClient>
			<HistoryView />
		</HydrateClient>
	)
}

export default HistoryPage
