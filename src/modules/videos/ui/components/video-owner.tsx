import Link from "next/link"

import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/user-avatar"

import { UserNameSpan } from "@/modules/users/ui/components/user-name-span"
import { useAuth } from "@/modules/auth/api/useAuth"
import { VideoGetOneOutput } from "../../types"
import { AVATAR_FALLBACK } from "@/constants"
import { useSubscription } from "@/modules/subscriptions/hooks/use-subscription"
import { SubscriptionButton } from "@/modules/subscriptions/ui/components/subscription-button"

interface VideoOwnerProps {
	user: VideoGetOneOutput["user"]
	videoId: string
}

export const VideoOwner = ({ user, videoId }: VideoOwnerProps) => {
	const { data, isLoading } = useAuth()

	const loginUserId = data?.id

	const { isPending, onClick } = useSubscription({
		userId: user.id,
		isSubscribed: user.viewerSubscribed,
		fromVideoId: videoId,
	})

	return (
		<div className="flex items-center sm:items-start justify-between sm:justify-start gap-3 min-w-0">
			<Link prefetch href={`/users/${user.id}`}>
				<div className="flex items-center gap-3 min-w-0">
					<UserAvatar size="lg" imageUrl={user.imageUrl || AVATAR_FALLBACK} name={user.name} />
					<div className="flex flex-col gap-1 min-w-0">
						<UserNameSpan size="lg" name={user.name} />
						<span className="text-sm text-muted-foreground line-clamp-1">
							{user.subscriberCount} 订阅者
						</span>
					</div>
				</div>
			</Link>
			{loginUserId === user.id ? (
				<Button variant="secondary" className="rounded-full" asChild>
					<Link prefetch href={`/studio/videos/${videoId}`}>
						编辑视频
					</Link>
				</Button>
			) : (
				<SubscriptionButton
					onClick={onClick}
					disabled={isPending || isLoading}
					isSubscribed={user.viewerSubscribed}
					className="flex-none"
				/>
			)}
		</div>
	)
}
