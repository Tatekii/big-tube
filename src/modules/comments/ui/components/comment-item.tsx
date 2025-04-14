import Link from "next/link"
import { toast } from "sonner"
import { useState } from "react"
import { formatDistanceToNow } from "date-fns"

import {
	ChevronDownIcon,
	ChevronUpIcon,
	MessageSquareIcon,
	MoreVerticalIcon,
	ThumbsDownIcon,
	ThumbsUpIcon,
	Trash2Icon,
} from "lucide-react"

import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/user-avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { CommentForm } from "./comment-form"
import { CommentReplies } from "./comment-replies"
import { CommentsGetManyOutput } from "../../types"
import { AVATAR_FALLBACK } from "@/constants"
import { useAuth } from "@/modules/auth/api/useAuth"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTRPC } from "@/trpc/client"
import useSignInModal from "@/modules/auth/hooks/use-sign-in-modal"

interface CommentItemProps {
	comment: CommentsGetManyOutput["items"][number]
	variant?: "reply" | "comment"
}

export const CommentItem = ({ comment, variant = "comment" }: CommentItemProps) => {
	const { data } = useAuth()
	const { open } = useSignInModal()
	const userId = data?.id

	const trpc = useTRPC()
	const queryClient = useQueryClient()

	const [isReplyOpen, setIsReplyOpen] = useState(false)
	const [isRepliesOpen, setIsRepliesOpen] = useState(false)

	const remove = useMutation(
		trpc.comments.remove.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries(trpc.comments.getMany.infiniteQueryFilter({ videoId: comment.videoId }))
				toast.success("评论已删除")
			},
			onError: (error) => {
				toast.error("出错了，请稍后再试")

				if (error.data?.code === "UNAUTHORIZED") {
					open()
				}
			},
		})
	)

	const like = useMutation(
		trpc.commentReactions.like.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries(trpc.comments.getMany.infiniteQueryFilter({ videoId: comment.videoId }))
			},
			onError: (error) => {
				toast.error("出错了，请稍后再试")

				if (error.data?.code === "UNAUTHORIZED") {
					open()
				}
			},
		})
	)

	const dislike = useMutation(
		trpc.commentReactions.dislike.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries(trpc.comments.getMany.infiniteQueryFilter({ videoId: comment.videoId }))
			},
			onError: (error) => {
				toast.error("出错了，请稍后再试")

				if (error.data?.code === "UNAUTHORIZED") {
					open()
				}
			},
		})
	)

	return (
		<div>
			<div className="flex gap-4">
				<Link prefetch href={`/users/${comment.userId}`}>
					<UserAvatar
						size={variant === "comment" ? "lg" : "sm"}
						imageUrl={comment.user.imageUrl || AVATAR_FALLBACK}
						name={comment.user.name}
					/>
				</Link>
				<div className="flex-1 min-w-0">
					<Link prefetch href={`/users/${comment.userId}`}>
						<div className="flex items-center gap-2 mb-0.5">
							<span className="font-medium text-sm pb-0.5">{comment.user.name}</span>
							<span className="text-xs text-muted-foreground">
								{formatDistanceToNow(comment.createdAt, {
									addSuffix: true,
								})}
							</span>
						</div>
					</Link>
					<p className="text-sm">{comment.value}</p>
					<div className="flex items-center gap-2 mt-1">
						<div className="flex items-center">
							<Button
								disabled={like.isPending}
								variant="ghost"
								size="icon"
								className="size-8"
								onClick={() => like.mutate({ commentId: comment.id })}
							>
								<ThumbsUpIcon className={cn(comment.viewerReaction === "like" && "fill-current")} />
							</Button>
							<span className="text-xs text-muted-foreground">{comment.likeCount}</span>
							<Button
								disabled={dislike.isPending}
								variant="ghost"
								size="icon"
								className="size-8"
								onClick={() => dislike.mutate({ commentId: comment.id })}
							>
								<ThumbsDownIcon className={cn(comment.viewerReaction === "dislike" && "fill-current")} />
							</Button>
							<span className="text-xs text-muted-foreground">{comment.dislikeCount}</span>
						</div>
						{variant === "comment" && (
							<Button variant="ghost" size="sm" className="h-8" onClick={() => setIsReplyOpen(true)}>
								回复
							</Button>
						)}
					</div>
				</div>
				<DropdownMenu modal={false}>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="icon" className="size-8">
							<MoreVerticalIcon />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => setIsReplyOpen(true)}>
							<MessageSquareIcon className="size-4" />
							Reply
						</DropdownMenuItem>
						{comment.user.id === userId && (
							<DropdownMenuItem onClick={() => remove.mutate({ id: comment.id })}>
								<Trash2Icon className="size-4" />
								Delete
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			{isReplyOpen && variant === "comment" && (
				<div className="mt-4 pl-14">
					<CommentForm
						variant="reply"
						parentId={comment.id}
						videoId={comment.videoId}
						onCancel={() => setIsReplyOpen(false)}
						onSuccess={() => {
							setIsReplyOpen(false)
							setIsRepliesOpen(true)
						}}
					/>
				</div>
			)}
			{comment.replyCount > 0 && variant === "comment" && (
				<div className="pl-14">
					<Button variant="tertiary" size="sm" onClick={() => setIsRepliesOpen((current) => !current)}>
						{isRepliesOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
						{comment.replyCount} replies
					</Button>
				</div>
			)}
			{comment.replyCount > 0 && variant === "comment" && isRepliesOpen && (
				<CommentReplies parentId={comment.id} videoId={comment.videoId} />
			)}
		</div>
	)
}
