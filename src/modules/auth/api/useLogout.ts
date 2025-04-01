import { trpc } from "@/trpc/client"
import { toast } from "sonner"

const useLogout = () => {
	const utils = trpc.useUtils()

	return trpc.auth.logout.useMutation({
		onSuccess: () => {
			toast.success("您已退出登录")

			// utils.auth.invalidate()
			utils.auth.invalidate()
		},
		onError: () => {
			toast.error("登出失败")
		},
	})
}

export default useLogout
