import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTRPC } from "@/trpc/client"

export default function UseRegister() {
	const queryClient = useQueryClient()
	const trpc = useTRPC()

	const router = useRouter()

	return useMutation(
		trpc.auth.register.mutationOptions({
			onSuccess: () => {
				toast.success("注册成功")

				router.refresh()

				queryClient.invalidateQueries(trpc.auth.current.pathFilter())
			},
			onError: () => {
				toast.error("注册失败")
			},
		})
	)
}
