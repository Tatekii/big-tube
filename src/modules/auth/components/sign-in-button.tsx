"use client"

import { Button } from "@/components/ui/button"
import { UserCircleIcon } from "lucide-react"
import useSignInModal from "../hooks/use-sign-in-modal"

export const SignInButton = () => {
	const { open } = useSignInModal()

	return (
		<Button
			variant="outline"
			className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 border-blue-500/20 rounded-full shadow-none"
			onClick={open}
		>
			<UserCircleIcon />
			{"登录"}
		</Button>
	)
}
