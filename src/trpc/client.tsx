/**
 * tRPC client for client components
 */
"use client"
// ^-- to make sure we can mount the Provider from a server component
import type { QueryClient } from "@tanstack/react-query"
import superjson from "superjson"
import { QueryClientProvider } from "@tanstack/react-query"
import { httpBatchLink, createTRPCClient } from "@trpc/client"
import { useState } from "react"
import { makeQueryClient } from "./query-client"

import { APP_URL } from "./constants"
import { AppRouter } from "./routers/_app"
import { createTRPCContext } from '@trpc/tanstack-react-query';

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>()

// 单例模式啦
let clientQueryClientSingleton: QueryClient

function getQueryClient() {
	if (typeof window === "undefined") {
		// Server: always make a new query client
		return makeQueryClient()
	}

	// Browser: make a new query client if we don't already have one
	// This is very important, so we don't re-make a new client if React
	// suspends during the initial render. This may not be needed if we
	// have a suspense boundary BELOW the creation of the query client
	return (clientQueryClientSingleton ??= makeQueryClient())
}

function getUrl() {
	const base = (() => {
		if (typeof window !== "undefined") return ""

		return APP_URL
	})()
	return `${base}/api/trpc`
}

export function TRPCReactProvider(
	props: Readonly<{
		children: React.ReactNode
	}>
) {
	// NOTE: Avoid useState when initializing the query client if you don't
	//       have a suspense boundary between this and the code that may
	//       suspend because React will throw away the client on the initial
	//       render if it suspends and there is no boundary
	const queryClient = getQueryClient()

	const [trpcClient] = useState(() =>
		createTRPCClient<AppRouter>({
			links: [
				httpBatchLink({
					transformer: superjson,
					url: getUrl(),
					async headers() {
						const headers = new Headers()
						headers.set("x-trpc-source", "nextjs-react")
						return headers
					},
				}),
			],
		})
	)
	return (
		<QueryClientProvider client={queryClient}>
			<TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
				{props.children}
			</TRPCProvider>
		</QueryClientProvider>
	)
}
