"use client"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { useTRPC } from "@/trpc/client"
import { InfiniteScroll } from "@/components/infinite-scroll"

import { VideoGridCard, VideoGridCardSkeleton } from "../components/video-grid-card"
import { VideoRowCard, VideoRowCardSkeleton } from "../components/video-row-card"

import { useSuspenseInfiniteQuery } from "@tanstack/react-query"
import { DEFAULT_LIMIT } from "@/trpc/constants"
import { FilterCarousel } from "@/components/filter-carousel"

interface SuggestionsSectionProps {
	videoId: string
	isManual?: boolean
}

export const SuggestionsSection = ({ videoId, isManual }: SuggestionsSectionProps) => {
	return (
		<Suspense fallback={<SuggestionsSectionSkeleton />}>
			<ErrorBoundary fallback={<p>出错了</p>}>
				{/* TODO 推荐中也有视频的分类 */}
				<FilterCarousel
					onSelect={()=>{}}
					data={[]}
				/>
				<SuggestionsSectionSuspense videoId={videoId} isManual={isManual} />
			</ErrorBoundary>
		</Suspense>
	)
}

export const SuggestionsSectionSkeleton = () => {
	return (
		<>
			<div className="hidden md:block space-y-3">
				{Array.from({ length: 6 }).map((_, index) => (
					<VideoRowCardSkeleton key={index} size="compact" />
				))}
			</div>
			<div className="block md:hidden space-y-10">
				{Array.from({ length: 6 }).map((_, index) => (
					<VideoGridCardSkeleton key={index} />
				))}
			</div>
		</>
	)
}

const SuggestionsSectionSuspense = ({ videoId, isManual }: SuggestionsSectionProps) => {
	const trpc = useTRPC()
	const {
		data: suggestions,
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
	} = useSuspenseInfiniteQuery(
		trpc.suggestions.getMany.infiniteQueryOptions(
			{
				videoId,
				limit: DEFAULT_LIMIT,
			},
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor,
			}
		)
	)

	return (
		<>
			<div className="hidden md:block space-y-3">
				{suggestions.pages.flatMap((page) =>
					page.items.map((video) => <VideoRowCard key={video.id} data={video} size="compact" />)
				)}
			</div>
			<div className="block md:hidden space-y-10">
				{suggestions.pages.flatMap((page) =>
					page.items.map((video) => <VideoGridCard key={video.id} data={video} />)
				)}
			</div>
			<InfiniteScroll
				isManual={isManual}
				hasNextPage={hasNextPage}
				isFetchingNextPage={isFetchingNextPage}
				fetchNextPage={fetchNextPage}
			/>
		</>
	)
}
