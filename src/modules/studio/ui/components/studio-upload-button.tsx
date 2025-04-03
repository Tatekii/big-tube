"use client"

import { Button } from "@/components/ui/button"
import { Loader2Icon, PlusIcon } from "lucide-react"
import { ResponsiveModal } from "@/components/responsive-modal"
import { StudioUploader } from "./studio-uploader"
import { useTRPC } from "@/trpc/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useCallback } from "react"

export const StudioUploadButton = () => {
	const router = useRouter()

	const trpc = useTRPC()

	const queryClient = useQueryClient()

	const studioQueryKey = trpc.studio.getMany.queryKey()

	const { mutate, data, isPending, reset } = useMutation(
		trpc.videos.create.mutationOptions({
			onSuccess: () => {
				toast.success("视频创建成功")

				queryClient.invalidateQueries({
					queryKey: studioQueryKey,
				})
			},
			onError: () => {
				toast.error("出错了")
			},
		})
	)

	const handleUploadSuccess = useCallback(() => {
		if (!data?.video.id) return
		reset()
		// TODO
		// router.push(`/studio/videos/${data.video.id}`)
	}, [data])

	return (
		<>
			<ResponsiveModal title="上传视频" open={!!data?.muxUrl} onOpenChange={() => reset()}>
				{data?.muxUrl ? (
					<StudioUploader endpoint={data.muxUrl} onUploadSuccess={handleUploadSuccess} />
				) : (
					<Loader2Icon />
				)}
			</ResponsiveModal>
			<Button variant="secondary" onClick={() => mutate()} disabled={isPending}>
				{isPending ? <Loader2Icon className="animate-spin" /> : <PlusIcon />}
				创建
			</Button>
		</>
	)
}
