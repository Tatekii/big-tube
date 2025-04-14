"use client"
import Link from "next/link"
import { toast } from "sonner"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { useTRPC } from "@/trpc/client"
import { InfiniteScroll } from "@/components/infinite-scroll"

import { SubscriptionItem, SubscriptionItemSkeleton } from "../components/subscription-item"

import { useSuspenseInfiniteQuery } from "@tanstack/react-query"
import { useMutation } from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query"
import { DEFAULT_LIMIT } from "@/trpc/constants"
import { AVATAR_FALLBACK } from "@/constants"

export const SubscriptionsSection = () => {
	return (
		<Suspense fallback={<SubscriptionsSectionSkeleton />}>
			<ErrorBoundary fallback={<p>出错了</p>}>
				<SubscriptionsSectionSuspense />
			</ErrorBoundary>
		</Suspense>
	)
}

const SubscriptionsSectionSkeleton = () => {
	return (
		<div className="flex flex-col gap-4">
			{Array.from({ length: 8 }).map((_, index) => (
				<SubscriptionItemSkeleton key={index} />
			))}
		</div>
	)
}

const SubscriptionsSectionSuspense = () => {
	const trpc = useTRPC()
	const queryClient = useQueryClient()
	const query = useSuspenseInfiniteQuery(
		trpc.subscriptions.getMany.infiniteQueryOptions(
			{ limit: DEFAULT_LIMIT },
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor,
			}
		)
	)

	const subscriptions = query.data

	const unsubscribe = useMutation(
		trpc.subscriptions.remove.mutationOptions({
			onSuccess: (data) => {
				toast.success("Unsubscribed")
				queryClient.invalidateQueries(trpc.subscriptions.getMany.pathFilter())
				queryClient.invalidateQueries(trpc.videos.getManySubscribed.pathFilter())
				queryClient.invalidateQueries(trpc.users.getOne.queryFilter({ id: data.creatorId }))
			},
			onError: () => {
				toast.error("Something went wrong")
			},
		})
	)

	return (
		<>
			<div className="flex flex-col gap-4">
				{subscriptions.pages
					.flatMap((page) => page.items)
					.map((subscription) => (
						<Link prefetch key={subscription.creatorId} href={`/users/${subscription.user.id}`}>
							<SubscriptionItem
								name={subscription.user.name}
								imageUrl={subscription.user.imageUrl || AVATAR_FALLBACK}
								subscriberCount={subscription.user.subscriberCount}
								onUnsubscribe={() => {
									unsubscribe.mutate({ userId: subscription.creatorId })
								}}
								disabled={unsubscribe.isPending}
							/>
						</Link>
					))}
			</div>
			<InfiniteScroll
				hasNextPage={query.hasNextPage}
				isFetchingNextPage={query.isFetchingNextPage}
				fetchNextPage={query.fetchNextPage}
			/>
		</>
	)
}
