"use client"
import { ResponsiveModal } from "@/components/responsive-modal"
import useSignInModal from "../hooks/useSignInModal"
import SignInCard from "./sign-in-card"

export const SignInModal = () => {
	const { isOpen, close } = useSignInModal()

	return (
		<ResponsiveModal open={isOpen === true} onOpenChange={close} title="登录">
			<SignInCard isModal/>
		</ResponsiveModal>
	)
}
