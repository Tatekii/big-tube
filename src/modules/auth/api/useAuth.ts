"use client"

import { trpc } from "@/trpc/client"

export function useAuth() {
	const data = trpc.auth.current.useQuery()
	return {
		data: data.data,
		isSignedIn: !!data.data,
	}
}
