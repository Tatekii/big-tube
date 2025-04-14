import { HydrateClient, prefetch, trpc } from "@/trpc/server"

import { SubscriptionsView } from "@/modules/subscriptions/ui/views/subscriptions-view"
import { DEFAULT_LIMIT } from "@/trpc/constants"

const SubscriptionsPage = async () => {
	prefetch(
		trpc.subscriptions.getMany.infiniteQueryOptions({
			limit: DEFAULT_LIMIT,
		})
	)
	return (
		<HydrateClient>
			<SubscriptionsView />
		</HydrateClient>
	)
}

export default SubscriptionsPage
