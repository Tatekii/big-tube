"use client"

import { trpc } from "@/trpc/client"

export function useAuth() {

	const query = trpc.auth.current.useQuery()
	
	return {
		data: query.data,
		isSignedIn: !!query.data,
		isLoading: query.isLoading,
	}
}
