import { toast } from "sonner"
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { useTRPC } from "@/trpc/client"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import { useMutation } from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query"
import { VideoGetOneOutput } from "../../types"
import useSignInModal from "@/modules/auth/hooks/use-sign-in-modal"

interface VideoReactionsProps {
	videoId: string
	likes: number
	dislikes: number
	viewerReaction: VideoGetOneOutput["viewerReaction"]
}

export const VideoReactions = ({ videoId, likes, dislikes, viewerReaction }: VideoReactionsProps) => {
	const trpc = useTRPC()

	const { open: openSignIn } = useSignInModal()

	const queryClient = useQueryClient()

	const like = useMutation(
		trpc.videoReactions.like.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries(trpc.videos.getOne.queryFilter({ id: videoId }))
				queryClient.invalidateQueries(trpc.playlists.getLiked.pathFilter())
			},
			onError: (error) => {
				toast.error("出错了，请稍后再试")

				if (error.data?.code === "UNAUTHORIZED") {
					openSignIn()
				}
			},
		})
	)

	const dislike = useMutation(
		trpc.videoReactions.dislike.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries(trpc.videos.getOne.queryFilter({ id: videoId }))
				queryClient.invalidateQueries(trpc.playlists.getLiked.pathFilter())
			},
			onError: (error) => {
				toast.error("出错了，请稍后再试")

				if (error.data?.code === "UNAUTHORIZED") {
					openSignIn()
				}
			},
		})
	)

	return (
		<div className="flex items-center flex-none">
			<Button
				onClick={() => like.mutate({ videoId })}
				disabled={like.isPending || dislike.isPending}
				variant="secondary"
				className="rounded-l-full rounded-r-none gap-2 pr-4"
			>
				<ThumbsUpIcon className={cn("size-5", viewerReaction === "like" && "fill-current")} />
				{likes}
			</Button>
			<Separator orientation="vertical" className="h-1" />
			<Button
				onClick={() => dislike.mutate({ videoId })}
				disabled={like.isPending || dislike.isPending}
				variant="secondary"
				className="rounded-l-none rounded-r-full pl-3"
			>
				<ThumbsDownIcon className={cn("size-5", viewerReaction === "dislike" && "fill-current")} />
				{dislikes}
			</Button>
		</div>
	)
}
