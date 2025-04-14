"use client"

import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { InfiniteScroll } from "@/components/infinite-scroll"

import { VideoGridCard, VideoGridCardSkeleton } from "@/modules/videos/ui/components/video-grid-card"
import { useTRPC } from "@/trpc/client"
import { DEFAULT_LIMIT } from "@/trpc/constants"
import { useSuspenseInfiniteQuery } from "@tanstack/react-query"

export const TrendingVideosSection = () => {
	return (
		<Suspense fallback={<TrendingVideosSectionSkeleton />}>
			<ErrorBoundary fallback={<p>出错了</p>}>
				<TrendingVideosSectionSuspense />
			</ErrorBoundary>
		</Suspense>
	)
}

const TrendingVideosSectionSkeleton = () => {
	return (
		<div className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
			{Array.from({ length: 18 }).map((_, index) => (
				<VideoGridCardSkeleton key={index} />
			))}
		</div>
	)
}

const TrendingVideosSectionSuspense = () => {
	const trpc = useTRPC()

	const query = useSuspenseInfiniteQuery(
		trpc.videos.getManyTrending.infiniteQueryOptions(
			{ limit: DEFAULT_LIMIT },
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor,
			}
		)
	)

	const videos = query.data

	return (
		<div>
			<div className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
				{videos.pages
					.flatMap((page) => page.items)
					.map((video) => (
						<VideoGridCard key={video.id} data={video} />
					))}
			</div>
			<InfiniteScroll
				hasNextPage={query.hasNextPage}
				isFetchingNextPage={query.isFetchingNextPage}
				fetchNextPage={query.fetchNextPage}
			/>
		</div>
	)
}
