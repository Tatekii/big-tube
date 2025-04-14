import Link from "next/link"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { UserAvatar } from "@/components/user-avatar"

import { UserGetOneOutput } from "../../types"

import { useSubscription } from "@/modules/subscriptions/hooks/use-subscription"
import { SubscriptionButton } from "@/modules/subscriptions/ui/components/subscription-button"
import { useAuth } from "@/modules/auth/api/useAuth"
import { AVATAR_FALLBACK } from "@/constants"

interface UserPageInfoProps {
	user: UserGetOneOutput
}

export const UserPageInfoSkeleton = () => {
	return (
		<div className="py-6">
			{/* Mobile layout */}
			<div className="flex flex-col md:hidden">
				<div className="flex items-center gap-3">
					<Skeleton className="h-[60px] w-[60px] rounded-full" />
					<div className="flex-1 min-w-0">
						<Skeleton className="h-6 w-32" />
						<Skeleton className="h-4 w-48 mt-1" />
					</div>
				</div>
				<Skeleton className="h-10 w-full mt-3 rounded-full" />
			</div>

			{/* Desktop Layout */}
			<div className="hidden md:flex items-start gap-4">
				<Skeleton className="h-[160px] w-[160px] rounded-full" />
				<div className="flex-1 min-w-0">
					<Skeleton className="h-8 w-64" />
					<Skeleton className="h-5 w-48 mt-4" />
					<Skeleton className="h-10 w-32 mt-3 rounded-full" />
				</div>
			</div>
		</div>
	)
}

export const UserPageInfo = ({ user }: UserPageInfoProps) => {
	const { data, isLoading } = useAuth()

	const userId = data?.id

	const { isPending, onClick } = useSubscription({
		userId: user.id,
		isSubscribed: user.viewerSubscribed,
	})

	return (
		<div className="py-6">
			{/* Mobile layout */}
			<div className="flex flex-col md:hidden">
				<div className="flex items-center gap-3">
					<UserAvatar
						size="lg"
						imageUrl={user.imageUrl || AVATAR_FALLBACK}
						name={user.name}
						className="h-[60px] w-[60px]"
						onClick={() => {
							if (user.id === userId) {
								open()
							}
						}}
					/>
					<div className="flex-1 min-w-0">
						<h1 className="text-xl font-bold">{user.name}</h1>
						<div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
							<span>{user.subscriberCount} 订阅</span>
							<span>&bull;</span>
							<span>{user.videoCount} 视频</span>
						</div>
					</div>
				</div>
				{userId === user.id ? (
					<Button variant="secondary" asChild className="w-full mt-3 rounded-full">
						<Link prefetch href="/studio">
							前往工作室
						</Link>
					</Button>
				) : (
					<SubscriptionButton
						disabled={isPending || isLoading}
						isSubscribed={user.viewerSubscribed}
						onClick={onClick}
						className="w-full mt-3"
					/>
				)}
			</div>

			{/* Desktop layout */}
			<div className="hidden md:flex items-start gap-4">
				<UserAvatar
					size="xl"
					imageUrl={user.imageUrl || AVATAR_FALLBACK}
					name={user.name}
					className={cn(
						userId === user.id && "cursor-pointer hover:opacity-80 transition-opacity duration-300"
					)}
					onClick={() => {
						if (user.id === userId) {
							open()
						}
					}}
				/>
				<div className="flex-1 min-w-0">
					<h1 className="text-4xl font-bold">{user.name}</h1>
					<div className="flex items-center gap-1 text-sm text-muted-foreground mt-3">
						<span>{user.subscriberCount} 订阅</span>
						<span>&bull;</span>
						<span>{user.videoCount} 视频</span>
					</div>
					{userId === user.id ? (
						<Button variant="secondary" asChild className="mt-3 rounded-full">
							<Link prefetch href="/studio">
								前往工作室
							</Link>
						</Button>
					) : (
						<SubscriptionButton
							disabled={isPending || isLoading}
							isSubscribed={user.viewerSubscribed}
							onClick={onClick}
							className="mt-3"
						/>
					)}
				</div>
			</div>
		</div>
	)
}
