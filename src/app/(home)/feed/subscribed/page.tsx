import { HydrateClient, prefetch, trpc } from "@/trpc/server"

import { SubscribedView } from "@/modules/home/ui/views/subscribed-view"
import { DEFAULT_LIMIT } from "@/trpc/constants"

export const dynamic = "force-dynamic"

const SubscribedPage = async () => {
	prefetch(trpc.videos.getManySubscribed.infiniteQueryOptions({ limit: DEFAULT_LIMIT }))

	return (
		<HydrateClient>
			<SubscribedView />
		</HydrateClient>
	)
}

export default SubscribedPage
