"use client"

import { ResponsiveModal } from "@/components/responsive-modal"
import { Button } from "@/components/ui/button"
import { UserCircleIcon } from "lucide-react"
import { useCallback, useState } from "react"
import SignInCard from "./sign-in-card"

export const SignInButton = () => {
	const [isOpen, setIsOpen] = useState(false)

	const open = useCallback(() => {
		setIsOpen(true)
	}, [])

	const close = useCallback(() => {
		setIsOpen(false)
	}, [])

	// TODO 登陆后关闭弹窗

	return (
		<>
			<Button
				variant="outline"
				className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 border-blue-500/20 rounded-full shadow-none"
				onClick={open}
			>
				<UserCircleIcon />
				{"登录"}
			</Button>
			<ResponsiveModal open={isOpen} onOpenChange={close} title="登录">
				<SignInCard />
			</ResponsiveModal>
		</>
	)
}
