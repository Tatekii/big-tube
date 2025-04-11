import Link from "next/link"

import { Skeleton } from "@/components/ui/skeleton"
import { SidebarHeader, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar"
import { useAuth } from "@/modules/auth/api/useAuth"
import { UserAvatar } from "@/components/user-avatar"
import { AVATAR_FALLBACK } from "@/constants"

export const StudioSidebarHeader = () => {
	const { data: user } = useAuth()

	const { state } = useSidebar()

	if (!user) {
		return (
			<SidebarHeader className="flex items-center justify-center pb-4">
				<Skeleton className="size-[112px] rounded-full" />
				<div className="flex flex-col items-center mt-2 gap-y-2">
					<Skeleton className="h-4 w-[80px]" />
					<Skeleton className="h-4 w-[100px]" />
				</div>
			</SidebarHeader>
		)
	}

	if (state === "collapsed") {
		return (
			<SidebarMenuItem>
				<SidebarMenuButton tooltip="Your profile" asChild>
					<Link prefetch href="/users/current">
						<UserAvatar
							imageUrl={user.imageUrl || AVATAR_FALLBACK}
							name={user.name ?? "User"}
							size="xs"
						/>
						<span className="text-sm">个人信息</span>
					</Link>
				</SidebarMenuButton>
			</SidebarMenuItem>
		)
	}

	return (
		<SidebarHeader className="flex items-center justify-center pb-4">
			<Link prefetch href="/users/current">
				<UserAvatar
					imageUrl={user.imageUrl || AVATAR_FALLBACK}
					name={user.name ?? "User"}
					className="size-[112px] hover:opacity-80 transition-opacity"
				/>
			</Link>
			<div className="flex flex-col items-center mt-2 gap-y-1">
				<p className="text-sm font-medium">个人信息</p>
				<p className="text-xs text-muted-foreground">{user.name}</p>
			</div>
		</SidebarHeader>
	)
}
