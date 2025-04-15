import { HydrateClient, prefetch, trpc } from "@/trpc/server"

import { SearchView } from "@/modules/search/ui/views/search-view"
import { DEFAULT_LIMIT } from "@/trpc/constants"

export const dynamic = "force-dynamic"

interface PageProps {
	searchParams: Promise<{
		query: string | undefined
		categoryId: string | undefined
	}>
}

const SearchPage = async ({ searchParams }: PageProps) => {
	const { query, categoryId } = await searchParams

	prefetch(trpc.categories.getMany.queryOptions())

	prefetch(
		trpc.search.getMany.infiniteQueryOptions({
			query,
			categoryId,
			limit: DEFAULT_LIMIT,
		})
	)

	return (
		<HydrateClient>
			<SearchView query={query} categoryId={categoryId} />
		</HydrateClient>
	)
}

export default SearchPage
