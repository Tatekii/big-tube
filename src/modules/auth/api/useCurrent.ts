import { trpc } from "@/trpc/client"

// TODO 记录登陆前想前往的路径，from=xxxx
const useCurrent = () => {
	return trpc.auth.current.useQuery()
}
export default useCurrent
