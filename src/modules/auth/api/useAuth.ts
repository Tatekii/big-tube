"use client"

import { useTRPC } from "@/trpc/client"
import { useQuery } from "@tanstack/react-query"

export function useAuth() {
	const trpc = useTRPC()

	const { isError, data, isSuccess, isLoading } = useQuery(
		trpc.auth.current.queryOptions(undefined, {
			retry: false,
		})
	)

	return {
		data: isError ? null : data?.data,
		isSignedIn: isSuccess && !!data?.data,
		isLoading: isLoading,
	}
}
