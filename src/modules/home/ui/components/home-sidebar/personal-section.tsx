"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HistoryIcon, ListVideoIcon, ThumbsUpIcon } from "lucide-react"

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/modules/auth/api/useAuth"
import useSignInModal from "@/modules/auth/hooks/use-sign-in-modal"

const items = [
	{
		title: "播放历史",
		url: "/playlists/history",
		icon: HistoryIcon,
		auth: true,
	},
	{
		title: "喜欢的视频",
		url: "/playlists/liked",
		icon: ThumbsUpIcon,
		auth: true,
	},
	{
		title: "播放列表",
		url: "/playlists",
		icon: ListVideoIcon,
		auth: true,
	},
]

export const PersonalSection = () => {
	const { isSignedIn } = useAuth()
	const pathname = usePathname()
	const { open } = useSignInModal()

	return (
		<SidebarGroup>
			<SidebarGroupLabel>我</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton
								tooltip={item.title}
								asChild
								isActive={pathname === item.url}
								onClick={(e) => {
									if (!isSignedIn && item.auth) {
										e.preventDefault()
										open()
										return
									}
								}}
							>
								<Link prefetch href={item.url} className="flex items-center gap-4">
									<item.icon />
									<span className="text-sm">{item.title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	)
}
