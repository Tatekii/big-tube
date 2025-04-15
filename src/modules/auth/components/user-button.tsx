"use client"

import { ClapperboardIcon, Loader, LogOut, UserIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import useLogout from "../api/useLogout"
import { LucideIcon } from "lucide-react"

import { useAuth } from "../api/useAuth"
import Link from "next/link"
import { FC, ReactNode } from "react"
import { SignInButton } from "./sign-in-button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { AVATAR_FALLBACK } from "@/constants"

export const UserButton = () => {
	const { mutate: logout } = useLogout()
	const { data: userData, isLoading } = useAuth()

	if (isLoading) {
		return (
			<div className="size-10 rounded-full flex items-center justify-center border">
				<Loader className="size-4 animate-spin text-muted-foreground" />
			</div>
		)
	}

	if (!userData) {
		return <SignInButton />
	}

	const { firstName, lastName, email, imageUrl } = userData

	const name = `${firstName} ${lastName}`

	const avatarFallback = name ? name.charAt(0).toUpperCase() : email.charAt(0).toUpperCase() ?? "U"

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger className="outline-none relative">
				<Avatar className="size-10 hover:opacity-75 transition border ">
					{imageUrl && <AvatarImage src={imageUrl} className="object-cover"/>}
					<AvatarFallback className=" font-medium text-neutral-500 flex items-center justify-center">
						{avatarFallback}
					</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" side="bottom" className="w-80" sideOffset={10}>
				<div className="flex flex-row items-center justify-start gap-4 p-2.5">
					<Avatar className="size-[48px] border border-neutral-300">
						{imageUrl && <AvatarImage src={imageUrl} className="object-cover"/>}
						<AvatarFallback className=" text-xl font-medium text-neutral-500 flex items-center justify-center">
							{avatarFallback}
						</AvatarFallback>
					</Avatar>

					<div className="flex flex-col justify-start gap-2">
						<p className="text-s font-medium">{name || "User"}</p>
						<p className="text-xs font-medium">{email}</p>
					</div>
				</div>

				<Separator />

				<ButtonItem icon={<UserIcon />} label="用户中心" href="/users/current" />

				<Separator />

				<ButtonItem icon={<ClapperboardIcon />} label="工作室" href="/studio" />

				<Separator />

				<ButtonItem icon={<LogOut />} label="退出登录" onClick={() => logout()} />
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
	className?: string
}

export const ButtonItem: FC<ButtonItemProps> = ({ icon: Icon, label, href, onClick, className }) => {
	const content = (
		<>
			{Icon && (typeof Icon === "function" ? <Icon className=" mr-2" /> : <span className=" mr-2">{Icon}</span>)}
			{label}
		</>
	)
	const cls = cn(`h-10 flex items-center font-medium cursor-pointer pl-5`, className)

	if (href) {
		return (
			<DropdownMenuItem asChild>
				<Link href={href} className={cls}>
					{content}
				</Link>
			</DropdownMenuItem>
		)
	}

	return (
		<DropdownMenuItem onClick={onClick} className={cls}>
			{content}
		</DropdownMenuItem>
	)
}

ButtonItem.displayName = "UserButton.Item"
