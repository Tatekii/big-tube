import { toast } from "sonner"
import { useTRPC } from "@/trpc/client"
import useSignInModal from "../hooks/useSignInModal"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export default function useLogin(isModal = false) {
	const { close } = useSignInModal()
	const { push } = useRouter()

	const trpc = useTRPC()
	const queryClient = useQueryClient()
	const currentQueryKey = trpc.auth.current.queryKey()

	return useMutation(
		trpc.auth.login.mutationOptions({
			onSuccess: () => {
				toast.success("登陆成功")

				queryClient.invalidateQueries({ queryKey: currentQueryKey })

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
