import { toast } from "sonner"
import { trpc } from "@/trpc/client"
import useSignInModal from "../hooks/useSignInModal"
import { useRouter } from "next/navigation"

export default function useLogin(isModal = false) {
	const { close } = useSignInModal()
	const { push } = useRouter()

	const utils = trpc.useUtils()

	return trpc.auth.login.useMutation({
		onSuccess: () => {
			toast.success("登陆成功")

			utils.auth.current.invalidate()

			if (isModal) {
				close()
			} else {
				push("/")
			}
		},
		onError: () => {
			toast.error("登陆失败")
		},
	})
}
