"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Skeleton } from "@/components/ui/skeleton"
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar"

import { UserAvatar } from "@/components/user-avatar"
import { ListIcon } from "lucide-react"
import { useTRPC } from "@/trpc/client"
import { useInfiniteQuery } from "@tanstack/react-query"
import { AVATAR_FALLBACK } from "@/constants"
import { InfiniteScroll } from "@/components/infinite-scroll"

export const LoadingSkeleton = () => {
	return (
		<>
			{[1, 2, 3, 4].map((i) => (
				<SidebarMenuItem key={i}>
					<SidebarMenuButton disabled>
						<Skeleton className="size-6 rounded-full shrink-0" />
						<Skeleton className="h-4 w-full" />
					</SidebarMenuButton>
				</SidebarMenuItem>
			))}
		</>
	)
}

export const SubscriptionsSection = () => {
	const pathname = usePathname()
	const trpc = useTRPC()

	const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery(
		trpc.subscriptions.getMany.infiniteQueryOptions(
			{
				limit: 7,
			},
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor,
			}
		)
	)

	return (
		<SidebarGroup>
			<SidebarGroupLabel>订阅</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{!isLoading && (
						<SidebarMenuItem>
							<SidebarMenuButton asChild isActive={pathname === "/subscriptions"}>
								<Link prefetch href="/subscriptions" className="flex items-center gap-4">
									<ListIcon className="size-4" />
									<span className="text-sm">所有订阅</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					)}

					{isLoading && <LoadingSkeleton />}
					{!isLoading &&
						data?.pages
							.flatMap((page) => page.items)
							.map((subscription) => (
								<SidebarMenuItem key={`${subscription.creatorId}-${subscription.viewerId}`}>
									<SidebarMenuButton
										tooltip={subscription.user.name}
										asChild
										isActive={pathname === `/users/${subscription.user.id}`}
									>
										<Link
											prefetch
											href={`/users/${subscription.user.id}`}
											className="flex items-center gap-4"
										>
											<UserAvatar
												size="xs"
												imageUrl={subscription.user.imageUrl || AVATAR_FALLBACK}
												name={subscription.user.name}
											/>
											<span className="text-sm">{subscription.user.name}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}

					<InfiniteScroll
						hasNextPage={hasNextPage}
						isFetchingNextPage={isFetchingNextPage}
						fetchNextPage={fetchNextPage}
					/>
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	)
}
