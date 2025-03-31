"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"

const AuthJumpButton = () => {
	const path = usePathname()

	const isSignup = path.endsWith("sign-up")
	const btnText = isSignup ? "登陆" : "注册"

	return (
		<Button asChild>
			<Link href={isSignup ? "/sign-in" : "sign-up"}>{btnText}</Link>
		</Button>
	)
}

export default AuthJumpButton
