"use client"
import { ResponsiveModal } from "@/components/responsive-modal"
import { UploadDropzone } from "@/lib/uploadthing"
import { useTRPC } from "@/trpc/client"
import { useQueryClient } from "@tanstack/react-query"

interface ThumbnailUploadModalProps {
	videoId: string
	open: boolean
	onOpenChange: (open: boolean) => void
}

export const ThumbnailUploadModal = ({ videoId, open, onOpenChange }: ThumbnailUploadModalProps) => {
	const trpc = useTRPC()
	const queryClient = useQueryClient()

	const onUploadComplete = () => {
		queryClient.invalidateQueries(trpc.studio.getMany.pathFilter())
		queryClient.invalidateQueries(trpc.studio.getOne.queryFilter({ id: videoId }))
	}

	return (
		<ResponsiveModal title="Upload a thumbnail" open={open} onOpenChange={onOpenChange}>
			<UploadDropzone
				endpoint="thumbnailUploader"
				input={{ videoId }}
				onClientUploadComplete={onUploadComplete}
			/>
		</ResponsiveModal>
	)
}
