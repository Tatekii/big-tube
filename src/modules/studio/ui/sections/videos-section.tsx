"use client"

import Link from "next/link"
import { Suspense } from "react"
import { format } from "date-fns"
import { Globe2Icon, LockIcon } from "lucide-react"
import { ErrorBoundary } from "react-error-boundary"

import { snakeCaseToTitle } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { InfiniteScroll } from "@/components/infinite-scroll"

import { useTRPC } from "@/trpc/client"
import { DEFAULT_LIMIT } from "@/trpc/constants"
import { useSuspenseInfiniteQuery } from "@tanstack/react-query"
import { VideoThumbnail } from "@/modules/videos/ui/components/video-thumbnail"
import { zhCN } from "date-fns/locale"

export const VideosSection = () => {
	return (
		<Suspense fallback={<VideosSectionSkeleton />}>
			<ErrorBoundary fallback={<p>出错了...</p>}>
				<VideosSectionSuspense />
			</ErrorBoundary>
		</Suspense>
	)
}

const CommonVideosTableHeader = (
	<TableRow>
		<TableHead className="pl-6 w-[510px] whitespace-nowrap">视频</TableHead>
		<TableHead className="whitespace-nowrap">可见性</TableHead>
		<TableHead className="whitespace-nowrap">状态</TableHead>
		<TableHead className="whitespace-nowrap">发布日期</TableHead>
		<TableHead className="text-right whitespace-nowrap">观看</TableHead>
		<TableHead className="text-right whitespace-nowrap">评论</TableHead>
		<TableHead className="text-right pr-6 whitespace-nowrap">喜欢</TableHead>
	</TableRow>
)

const VideosSectionSkeleton = () => {
	return (
		<>
			<div className="border-y">
				<Table>
					<TableHeader>{CommonVideosTableHeader}</TableHeader>
					<TableBody>
						{Array.from({ length: 5 }).map((_, index) => (
							<TableRow key={index}>
								<TableCell className="pl-6">
									<div className="flex items-center gap-4">
										<Skeleton className="h-20 w-36" />
										<div className="flex flex-col gap-2">
											<Skeleton className="h-4 w-[100px]" />
											<Skeleton className="h-3 w-[150px]" />
										</div>
									</div>
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-20" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-16" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-24" />
								</TableCell>
								<TableCell className="text-right">
									<Skeleton className="h-4 w-12 ml-auto" />
								</TableCell>
								<TableCell className="text-right">
									<Skeleton className="h-4 w-12 ml-auto" />
								</TableCell>
								<TableCell className="text-right pr-6">
									<Skeleton className="h-4 w-12 ml-auto" />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</>
	)
}

const VideosSectionSuspense = () => {
	const trpc = useTRPC()

	const {
		data: videos,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
	} = useSuspenseInfiniteQuery(
		trpc.studio.getMany.infiniteQueryOptions(
			{
				limit: DEFAULT_LIMIT,
			},
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor,
			}
		)
	)

	return (
		<div>
			<div className="border-y">
				<Table>
					<TableHeader>{CommonVideosTableHeader}</TableHeader>
					<TableBody>
						{videos.pages
							.flatMap((page) => page.items)
							.map((video) => (
								<Link prefetch href={`/studio/videos/${video.id}`} key={video.id} legacyBehavior>
									<TableRow className="cursor-pointer">
										<TableCell className="pl-6">
											<div className="flex items-center gap-4">
												<div className="relative aspect-video w-36 shrink-0">
													<VideoThumbnail
														imageUrl={video.thumbnailUrl}
														previewUrl={video.previewUrl}
														title={video.title}
														duration={video.duration || 0}
													/>
												</div>
												<div className="flex flex-col overflow-hidden gap-y-1">
													<span className="text-sm line-clamp-1">{video.title}</span>
													<span className="text-xs text-muted-foreground line-clamp-1">
														{video.description || "无简介"}
													</span>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center">
												{video.visibility === "private" ? (
													<LockIcon className="size-4 mr-2" />
												) : (
													<Globe2Icon className="size-4 mr-2" />
												)}
												{snakeCaseToTitle(video.visibility)}
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center">
												{snakeCaseToTitle(video.muxStatus || "error")}
											</div>
										</TableCell>
										<TableCell className="text-sm truncate">
											{format(new Date(video.createdAt), "d MMM yyyy", { locale: zhCN })}
										</TableCell>
										<TableCell className="text-right text-sm">{video.viewCount}</TableCell>
										<TableCell className="text-right text-sm">{video.commentCount}</TableCell>
										<TableCell className="text-right text-sm pr-6">{video.likeCount}</TableCell>
									</TableRow>
								</Link>
							))}
					</TableBody>
				</Table>
			</div>
			<InfiniteScroll
				isManual
				hasNextPage={hasNextPage}
				isFetchingNextPage={isFetchingNextPage}
				fetchNextPage={fetchNextPage}
			/>
		</div>
	)
}
