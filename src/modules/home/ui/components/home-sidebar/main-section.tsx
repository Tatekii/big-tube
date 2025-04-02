"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { FlameIcon, HomeIcon, PlaySquareIcon } from "lucide-react"

import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/modules/auth/api/useAuth"
import useSignInModal from "@/modules/auth/hooks/use-sign-in-modal"

const items = [
	{
		title: "首页",
		url: "/",
		icon: HomeIcon,
	},
	{
		title: "已订阅",
		url: "/feed/subscribed",
		icon: PlaySquareIcon,
		auth: true,
	},
	{
		title: "当下流行",
		url: "/feed/trending",
		icon: FlameIcon,
	},
]

export const MainSection = () => {
	const { isSignedIn: signedIn } = useAuth()
	const { open } = useSignInModal()

	const pathname = usePathname()

	return (
		<SidebarGroup>
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton
								tooltip={item.title}
								asChild
								isActive={pathname === item.url}
								onClick={(e) => {
									if (!signedIn && item.auth) {
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
