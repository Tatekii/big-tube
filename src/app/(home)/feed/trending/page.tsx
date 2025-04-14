import { HydrateClient, prefetch, trpc } from "@/trpc/server"

import { TrendingView } from "@/modules/home/ui/views/trending-view"
import { DEFAULT_LIMIT } from "@/trpc/constants"

export const dynamic = "force-dynamic"

const TrendingPage = async () => {
	prefetch(
		trpc.videos.getManyTrending.infiniteQueryOptions({
			limit: DEFAULT_LIMIT,
		})
	)

	return (
		<HydrateClient>
			<TrendingView />
		</HydrateClient>
	)
}

export default TrendingPage
