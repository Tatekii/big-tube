import { trpc } from "@/trpc/client"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const useLogout = () => {
	const router = useRouter()
	const queryClient = useQueryClient()

	return trpc.auth.logout.useMutation({
		onSuccess: () => {
			toast.success("您已退出登录")
			router.refresh()
			queryClient.invalidateQueries({ queryKey: ["current"] })
			queryClient.invalidateQueries({ queryKey: ["workspaces"] })
		},
		onError: () => {
			toast.error("登出失败")
		},
	})
}

export default useLogout
