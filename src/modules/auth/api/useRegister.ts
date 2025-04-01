import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTRPC } from "@/trpc/client"

export default function UseRegister() {
	const queryClient = useQueryClient()
	const trpc = useTRPC()

	const router = useRouter()
	const currentQueryKey = trpc.auth.current.queryKey()

	return useMutation(
		trpc.auth.register.mutationOptions({
			onSuccess: () => {
				toast.success("注册成功")

				router.refresh()

				queryClient.invalidateQueries({ queryKey: currentQueryKey })
			},
			onError: () => {
				toast.error("注册失败")
			},
		})
	)
}
