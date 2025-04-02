import { useTRPC } from "@/trpc/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const useLogout = () => {
	const trpc = useTRPC()
	const queryClient = useQueryClient()
	const currentQueryKey = trpc.auth.current.queryKey()
	const route = useRouter()

	return useMutation(
		trpc.auth.logout.mutationOptions({
			onSuccess: () => {
				toast.success("您已退出登录")

				route.push("/")

				queryClient.invalidateQueries({ queryKey: currentQueryKey })
			},
			onError: () => {
				toast.error("登出失败")
			},
		})
	)
}

export default useLogout
