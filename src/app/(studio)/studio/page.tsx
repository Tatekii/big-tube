import { HydrateClient, prefetch, trpc } from "@/trpc/server"

import { StudioView } from "@/modules/studio/ui/views/studio-view"
import { DEFAULT_LIMIT } from "@/trpc/constants"

export const dynamic = "force-dynamic"

const StudioPage = async () => {
	prefetch(
		trpc.studio.getMany.infiniteQueryOptions({
			limit: DEFAULT_LIMIT,
		})
	)

	return (
		<HydrateClient>
			<StudioView />
		</HydrateClient>
	)
}

export default StudioPage
