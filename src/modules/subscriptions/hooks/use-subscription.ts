import { toast } from "sonner"

import { useTRPC } from "@/trpc/client"
import useSignInModal from "@/modules/auth/hooks/use-sign-in-modal"

import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

interface UseSubscriptionProps {
	userId: string
	isSubscribed: boolean
	fromVideoId?: string
}

export const useSubscription = ({ userId, isSubscribed, fromVideoId }: UseSubscriptionProps) => {
    const trpc = useTRPC();
    const { open } = useSignInModal()

    const queryClient = useQueryClient()

    const subscribe = useMutation(trpc.subscriptions.create.mutationOptions({
		onSuccess: () => {
			toast.success("Subscribed")
			queryClient.invalidateQueries(trpc.subscriptions.getMany.pathFilter())
			queryClient.invalidateQueries(trpc.videos.getManySubscribed.pathFilter())
			queryClient.invalidateQueries(trpc.users.getOne.queryFilter({ id: userId }))

			if (fromVideoId) {
				queryClient.invalidateQueries(trpc.videos.getOne.queryFilter({ id: fromVideoId }))
			}
		},
		onError: (error) => {
			toast.error("Something went wrong")

			if (error.data?.code === "UNAUTHORIZED") {
				open()
			}
		},
	}))

    const unsubscribe = useMutation(trpc.subscriptions.remove.mutationOptions({
		onSuccess: () => {
			toast.success("Subscribed")
			queryClient.invalidateQueries(trpc.subscriptions.getMany.pathFilter())
			queryClient.invalidateQueries(trpc.videos.getManySubscribed.pathFilter())
			queryClient.invalidateQueries(trpc.users.getOne.queryFilter({ id: userId }))

			if (fromVideoId) {
				queryClient.invalidateQueries(trpc.videos.getOne.queryFilter({ id: fromVideoId }))
			}
		},
		onError: (error) => {
			toast.error("Something went wrong")

			if (error.data?.code === "UNAUTHORIZED") {
				open()
			}
		},
	}))

    const isPending = subscribe.isPending || unsubscribe.isPending

    const onClick = () => {
		if (isSubscribed) {
			unsubscribe.mutate({ userId })
		} else {
			subscribe.mutate({ userId })
		}
	}

    return {
		isPending,
		onClick,
	}
}
