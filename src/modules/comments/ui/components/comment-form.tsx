import { z } from "zod"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { commentInsertSchema } from "@/db/schema"
import { Textarea } from "@/components/ui/textarea"
import { UserAvatar } from "@/components/user-avatar"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { useAuth } from "@/modules/auth/api/useAuth"
import { useTRPC } from "@/trpc/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import useSignInModal from "@/modules/auth/hooks/use-sign-in-modal"
import { AVATAR_FALLBACK } from "@/constants"

interface CommentFormProps {
	videoId: string
	parentId?: string
	onSuccess?: () => void
	onCancel?: () => void
	variant?: "comment" | "reply"
}

type TCommentInsert = z.infer<typeof commentInsertSchema>
type TCommentForm = Omit<TCommentInsert, "userId" | "createAt" | "updateAt">

export const CommentForm = ({ videoId, parentId, onCancel, onSuccess, variant = "comment" }: CommentFormProps) => {
	const { data: user } = useAuth()
	const { open } = useSignInModal()
	const queryClient = useQueryClient()

	const trpc = useTRPC()

	const create = useMutation(
		trpc.comments.create.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries(trpc.comments.getMany.infiniteQueryFilter({ videoId }))
				queryClient.invalidateQueries(trpc.comments.getMany.infiniteQueryFilter({ videoId, parentId }))

				form.reset()

				toast.success("评论已添加")

				onSuccess?.()
			},
			onError: (error) => {
				toast.error("出错了，请稍后再试")

				if (error.data?.code === "UNAUTHORIZED") {
					open()
				}
			},
		})
	)

	const form = useForm<TCommentForm>({
		resolver: zodResolver(commentInsertSchema.omit({ userId: true, createdAt: true, updatedAt: true })),
		defaultValues: {
			parentId: parentId,
			videoId: videoId,
			value: "",
		},
	})

	const handleSubmit = (values: TCommentForm) => {
		create.mutate(values)
	}

	const handleCancel = () => {
		form.reset()
		onCancel?.()
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="flex gap-4 group">
				<UserAvatar size="lg" imageUrl={user?.imageUrl || AVATAR_FALLBACK} name={user?.name || "User"} />
				<div className="flex-1">
					<FormField
						name="value"
						control={form.control}
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Textarea
										{...field}
										placeholder={
											variant === "reply" ? "Reply to this comment..." : "Add a comment..."
										}
										className="resize-none bg-transparent overflow-hidden min-h-0"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className="justify-end gap-2 mt-2 flex">
						{onCancel && (
							<Button variant="ghost" type="button" onClick={handleCancel}>
								取消
							</Button>
						)}
						<Button disabled={create.isPending} type="submit" size="sm">
							{variant === "reply" ? "回复" : "评论"}
						</Button>
					</div>
				</div>
			</form>
		</Form>
	)
}
