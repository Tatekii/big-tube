"use client"

import { z } from "zod"
import Link from "next/link"
import { toast } from "sonner"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { Suspense, useState } from "react"
import { useRouter } from "next/navigation"
import { ErrorBoundary } from "react-error-boundary"
import { zodResolver } from "@hookform/resolvers/zod"
import {
	CopyIcon,
	Globe2Icon,
	ImagePlusIcon,
	Loader2Icon,
	LockIcon,
	MoreVerticalIcon,
	RotateCcwIcon,
	SparklesIcon,
	TrashIcon,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { snakeCaseToTitle } from "@/lib/utils"
import { videoUpdateSchema } from "@/db/schema"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Form, FormControl, FormField, FormLabel, FormMessage, FormItem } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { THUMBNAIL_FALLBACK } from "@/constants"
import { VideoPlayer } from "@/modules/videos/ui/components/video-player"

import { APP_URL } from "@/constants"
import { useTRPC } from "@/trpc/client"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { ThumbnailUploadModal } from "../components/thumbnail-upload-modal"

interface FormSectionProps {
	videoId: string
}

export const StudioFormSection = ({ videoId }: FormSectionProps) => {
	return (
		<Suspense fallback={<FormSectionSkeleton />}>
			<ErrorBoundary fallback={<p>出错了</p>}>
				<FormSectionSuspense videoId={videoId} />
			</ErrorBoundary>
		</Suspense>
	)
}

export const FormSectionSkeleton = () => {
	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<div className="space-y-2">
					<Skeleton className="h-7 w-32" />
					<Skeleton className="h-4 w-40" />
				</div>
				<Skeleton className="h-9 w-24" />
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
				<div className="space-y-8 lg:col-span-3">
					<div className="space-y-2">
						<Skeleton className="h-5 w-16" />
						<Skeleton className="h-10 w-full" />
					</div>
					<div className="space-y-2">
						<Skeleton className="h-5 w-24" />
						<Skeleton className="h-[220px] w-full" />
					</div>
					<div className="space-y-2">
						<Skeleton className="h-5 w-20" />
						<Skeleton className="h-[84px] w-[153px]" />
					</div>
					<div className="space-y-2">
						<Skeleton className="h-5 w-20" />
						<Skeleton className="h-10 w-full" />
					</div>
				</div>
				<div className="flex flex-col gap-y-8 lg:col-span-2">
					<div className="flex flex-col gap-4 bg-[#F9F9F9] rounded-xl overflow-hidden">
						<Skeleton className="aspect-video" />
						<div className="px-4 py-4 space-y-6">
							<div className="space-y-2">
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-5 w-full" />
							</div>
							<div className="space-y-2">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-5 w-32" />
							</div>
							<div className="space-y-2">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-5 w-32" />
							</div>
						</div>
					</div>
					<div className="space-y-2">
						<Skeleton className="h-5 w-20" />
						<Skeleton className="h-10 w-full" />
					</div>
				</div>
			</div>
		</div>
	)
}

const FormSectionSuspense = ({ videoId }: FormSectionProps) => {
	const router = useRouter()

	const trpc = useTRPC()

	const queryClient = useQueryClient()

	const invalidVideoList = () => queryClient.invalidateQueries(trpc.studio.getMany.pathFilter())
	const invalidCurVideo = () => queryClient.invalidateQueries(trpc.studio.getOne.queryFilter({ id: videoId }))

	const [thumbnailModalOpen, setThumbnailModalOpen] = useState(false)

	const { data: video } = useSuspenseQuery(
		trpc.studio.getOne.queryOptions({
			id: videoId,
		})
	)

	const { data: categories } = useSuspenseQuery(trpc.categories.getMany.queryOptions())

	const update = useMutation(
		trpc.videos.update.mutationOptions({
			onSuccess: () => {
				invalidCurVideo()
				invalidVideoList()
				toast.success("已更新")
			},
			onError: () => {
				toast.error("出错了")
			},
		})
	)

	const remove = useMutation(
		trpc.videos.remove.mutationOptions({
			onSuccess: () => {
				invalidVideoList()

				toast.success("视频已删除")
				router.push("/studio")
			},
			onError: () => {
				toast.error("出错了")
			},
		})
	)

	const restoreThumbnail = useMutation(
		trpc.videos.restoreThumbnail.mutationOptions({
			onSuccess: () => {
				invalidVideoList()
				invalidCurVideo()
				toast.success("Thumbnail restored")
			},
			onError: () => {
				toast.error("出错了，请稍后再试")
			},
		})
	)

	const form = useForm<z.infer<typeof videoUpdateSchema>>({
		resolver: zodResolver(videoUpdateSchema),
		defaultValues: video,
	})

	const onSubmit = (data: z.infer<typeof videoUpdateSchema>) => {
		update.mutate(data)
	}

	const fullUrl = `${APP_URL}/videos/${videoId}`

	const onCopy = async () => {
		await navigator.clipboard.writeText(fullUrl)
		toast.info("已拷贝到剪贴板")
	}

	return (
		<>
			{/* 封面上传 */}
			<ThumbnailUploadModal open={thumbnailModalOpen} onOpenChange={setThumbnailModalOpen} videoId={videoId} />

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<div className="flex items-center justify-between mb-6">
						<div>
							<h1 className="text-2xl font-bold">视频详情</h1>
							<p className="text-xs text-muted-foreground">管理这个视频</p>
						</div>
						<div className="flex items-center gap-x-2">
							<Button type="submit" disabled={update.isPending || !form.formState.isDirty}>
								保存
							</Button>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon">
										<MoreVerticalIcon />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={() => remove.mutate({ id: videoId })}>
										<TrashIcon className="size-4 mr-2" />
										删除
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
					<div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
						<div className="space-y-8 lg:col-span-3">
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<div className="flex items-center gap-x-2">
												标题
												<Button
													size="icon"
													variant="outline"
													type="button"
													className="rounded-full size-6 [&_svg]:size-3"
												>
													{false ? (
														<Loader2Icon className="animate-spin" />
													) : (
														<SparklesIcon />
													)}
												</Button>
											</div>
										</FormLabel>
										<FormControl>
											<Input {...field} placeholder="Add a title to your video" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<div className="flex items-center gap-x-2">
												简介
												<Button
													size="icon"
													variant="outline"
													type="button"
													className="rounded-full size-6 [&_svg]:size-3"
												>
													{false ? (
														<Loader2Icon className="animate-spin" />
													) : (
														<SparklesIcon />
													)}
												</Button>
											</div>
										</FormLabel>
										<FormControl>
											<Textarea
												{...field}
												value={field.value ?? ""}
												rows={10}
												className="resize-none pr-10"
												placeholder="为此视频添加简介"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								name="thumbnailUrl"
								control={form.control}
								render={() => (
									<FormItem>
										<FormLabel>封面</FormLabel>
										<FormControl>
											<div className="p-0.5 border border-dashed border-neutral-400 relative h-[84px] w-[153px] group">
												<Image
													src={video.thumbnailUrl || THUMBNAIL_FALLBACK}
													className="object-cover"
													fill
													alt="Thumbnail"
												/>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															type="button"
															size="icon"
															className="bg-black/50 hover:bg-black/50 absolute top-1 right-1 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 duration-300 size-7"
														>
															<MoreVerticalIcon className="text-white" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="start" side="right">
														<DropdownMenuItem onClick={() => setThumbnailModalOpen(true)}>
															<ImagePlusIcon className="size-4 mr-1" />
															更改
														</DropdownMenuItem>
														<DropdownMenuItem onClick={() => {}}>
															<SparklesIcon className="size-4 mr-1" />
															AI-生成
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => restoreThumbnail.mutate({ id: videoId })}
														>
															<RotateCcwIcon className="size-4 mr-1" />
															重置
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="categoryId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>视频分类</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a category" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{categories.map((category) => (
													<SelectItem key={category.id} value={category.id}>
														{category.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className="flex flex-col gap-y-8 lg:col-span-2">
							<div className="flex flex-col gap-4 dark:bg-black bg-white rounded-xl overflow-hidden h-fit">
								<div className="aspect-video overflow-hidden relative">
									<VideoPlayer playbackId={video.muxPlaybackId} thumbnailUrl={video.thumbnailUrl} />
								</div>
								<div className="p-4 flex flex-col gap-y-6">
									<div className="flex justify-between items-center gap-x-2">
										<div className="flex flex-col gap-y-1">
											<p className="text-muted-foreground text-xs">视频链接</p>
											<div className="flex items-center gap-x-2">
												<Link prefetch href={`/videos/${video.id}`}>
													<p className="line-clamp-1 text-sm text-blue-500">{fullUrl}</p>
												</Link>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													className="shrink-0"
													onClick={onCopy}
												>
													<CopyIcon />
												</Button>
											</div>
										</div>
									</div>

									<div className="flex justify-between items-center">
										<div className="flex flex-col gap-y-1">
											<p className="text-muted-foreground text-xs">视频状态</p>
											<p className="text-sm">
												{snakeCaseToTitle(video.muxStatus || "preparing")}
											</p>
										</div>
									</div>

									<div className="flex justify-between items-center">
										<div className="flex flex-col gap-y-1">
											<p className="text-muted-foreground text-xs">字幕状态</p>
											<p className="text-sm">
												{snakeCaseToTitle(video.muxTrackStatus || "no_subtitles")}
											</p>
										</div>
									</div>
								</div>
							</div>

							<FormField
								control={form.control}
								name="visibility"
								render={({ field }) => (
									<FormItem>
										<FormLabel>可见性</FormLabel>
										<Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select visibility" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="public">
													<div className="flex items-center">
														<Globe2Icon className="size-4 mr-2" />
														公开
													</div>
												</SelectItem>
												<SelectItem value="private">
													<div className="flex items-center">
														<LockIcon className="size-4 mr-2" />
														隐藏
													</div>
												</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>
				</form>
			</Form>
		</>
	)
}
