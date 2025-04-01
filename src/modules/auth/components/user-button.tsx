"use client"

import { Loader, LogOut } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import useLogout from "../api/useLogout"
import { LucideIcon } from "lucide-react"

import { DottedSeparator } from "@/components/dotted-separator"
import { useAuth } from "../api/useAuth"
import Link from "next/link"
import { ReactNode } from "react"
import { SignInButton } from "./sign-in-button"

export const UserButton = () => {
	const { mutate: logout } = useLogout()
	const { data: userData, isLoading } = useAuth()

	if (isLoading) {
		return (
			<div className="size-10 rounded-full flex items-center justify-center bg-neutral-200 border border-neutral-300">
				<Loader className="size-4 animate-spin text-muted-foreground" />
			</div>
		)
	}

	if (!userData) {
		return <SignInButton />
	}

	const { firstName, lastName, email } = userData

	const name = `${firstName} ${lastName}`

	const avatarFallback = name ? name.charAt(0).toUpperCase() : email.charAt(0).toUpperCase() ?? "U"

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger className="outline-none relative">
				<Avatar className="size-10 hover:opacity-75 transition border border-neutral-300">
					<AvatarFallback className="bg-neutral-200 font-medium text-neutral-500 flex items-center justify-center">
						{avatarFallback}
					</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" side="bottom" className="w-60" sideOffset={10}>
				<div className="flex flex-col items-center justify-center gap-2 px-2.5 py-4">
					<Avatar className="size-[52px] border border-neutral-300">
						<AvatarFallback className="bg-neutral-200 text-xl font-medium text-neutral-500 flex items-center justify-center">
							{avatarFallback}
						</AvatarFallback>
					</Avatar>
					<div className="flex flex-row items-center justify-center gap-2">
						<p className="text-sm font-medium text-neutral-900">{name || "User"}</p>
						<p className="text-xs text-neutral-500">{email}</p>
					</div>
				</div>

				<DottedSeparator />

				<ButtonItem icon={<LogOut />} label="退出登录" onClick={() => logout()} />
				{/* 
				<DropdownMenuItem
					onClick={() => logout()}
					className="h-10 flex items-center justify-center text-amber-700 font-medium cursor-pointer"
				>
					<LogOut className="size-4 mr-2" />
					{"登出"}
				</DropdownMenuItem> */}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

UserButton.displayName = "UserButton"

interface ButtonItemProps {
	icon?: LucideIcon | ReactNode
	label: string
	href?: string
	onClick?: () => void
}

export const ButtonItem = ({ icon: Icon, label, href, onClick }: ButtonItemProps) => {
	const content = (
		<>
			{Icon && (typeof Icon === "function" ? <Icon className=" mr-2" /> : <span className=" mr-2">{Icon}</span>)}
			{label}
		</>
	)

	if (href) {
		return (
			<DropdownMenuItem asChild>
				<Link href={href} className="flex items-center">
					{content}
				</Link>
			</DropdownMenuItem>
		)
	}

	return (
		<DropdownMenuItem
			onClick={onClick}
			className="h-10 flex items-center justify-center font-medium cursor-pointer"
		>
			{content}
		</DropdownMenuItem>
	)
}

ButtonItem.displayName = "UserButton.Item"
