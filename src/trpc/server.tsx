import "server-only" // <-- ensure this file cannot be imported from the client

import { cache } from "react"
import { createCallerFactory, createTRPCContext } from "./init"
import { makeQueryClient } from "./query-client"
import { appRouter } from "./routers/_app"
import { createTRPCOptionsProxy, TRPCQueryOptions } from "@trpc/tanstack-react-query"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
export const getQueryClient = cache(makeQueryClient)

/**
 * this method is detached from your query client and does not store the data in the cache.
 * This means that you cannot use the data in a server component and expect it to be available in the client.
 */
export const caller = createCallerFactory(appRouter)(createTRPCContext)

// export const { trpc, HydrateClient } = createHydrationHelpers<typeof appRouter>(
//   caller,
//   getQueryClient,
// );

export const trpc = createTRPCOptionsProxy({
	ctx: createTRPCContext,
	router: appRouter,
	queryClient: getQueryClient,
})

export function HydrateClient(props: { children: React.ReactNode }) {
	const queryClient = getQueryClient()
	return <HydrationBoundary state={dehydrate(queryClient)}>{props.children}</HydrationBoundary>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(queryOptions: T) {
	const queryClient = getQueryClient()
	if (queryOptions.queryKey[1]?.type === "infinite") {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		void queryClient.prefetchInfiniteQuery(queryOptions as any)
	} else {
		void queryClient.prefetchQuery(queryOptions)
	}
}
