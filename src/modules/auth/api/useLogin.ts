import { toast } from "sonner"
// import { useRouter } from "next/navigation"
import { trpc } from "@/trpc/client"

export default function UseLogin() {
	// const router = useRouter()

	return trpc.auth.login.useMutation({
		onSuccess: () => {
			toast.success("登陆成功")
			// TODO 单页面登陆后跳转
			// router.refresh()
		},
		onError: () => {
			toast.error("登陆失败")
		},
	})
}
