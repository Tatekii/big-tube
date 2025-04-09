import { toast } from "sonner"
import { useTRPC } from "@/trpc/client"
import useSignInModal from "../hooks/use-sign-in-modal"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export default function useLogin(isModal = false) {
	const { close } = useSignInModal()
	const { push } = useRouter()

	const trpc = useTRPC()
	const queryClient = useQueryClient()

	return useMutation(
		trpc.auth.login.mutationOptions({
			onSuccess: () => {
				toast.success("登陆成功")

				queryClient.invalidateQueries(trpc.auth.current.pathFilter())

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
	)
}
