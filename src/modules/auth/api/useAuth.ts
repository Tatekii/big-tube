"use client"

import { trpc } from "@/trpc/client"

export function useAuth() {
	const { isError, data, isSuccess, isLoading } = trpc.auth.current.useQuery(undefined, {
		retry: false,
	})
	
	return {
		data: isError ? null : data?.data,
		isSignedIn: isSuccess && !!data?.data,
		isLoading: isLoading,
	}
}
