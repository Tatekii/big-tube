import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"

import { trpc } from "@/trpc/client"

export default function UseRegister() {
	const queryClient = useQueryClient()
	const router = useRouter()

	return trpc.auth.register.useMutation({
		onSuccess: () => {
			toast.success("注册成功")
			router.refresh()
			queryClient.invalidateQueries({ queryKey: ["current"] })
		},
		onError: () => {
			toast.error("注册失败")
		},
	})
}
