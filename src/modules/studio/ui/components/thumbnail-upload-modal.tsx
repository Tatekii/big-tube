// import { trpc } from "@/trpc/client"
// import { UploadDropzone } from "@/lib/uploadthing"
import { ResponsiveModal } from "@/components/responsive-modal"
import { useQueryClient } from "@tanstack/react-query"

interface ThumbnailUploadModalProps {
	videoId: string
	open: boolean
	onOpenChange: (open: boolean) => void
}

export const ThumbnailUploadModal = ({ videoId, open, onOpenChange }: ThumbnailUploadModalProps) => {
	const queryClient = useQueryClient()

	// const onUploadComplete = () => {

	//   queryClient.invalidateQueries({
	//     queryKey:
	//   })

	//   utils.studio.getMany.invalidate();

	//   utils.studio.getOne.invalidate({ id: videoId });
	//   onOpenChange(false);
	// };

	return (
		<ResponsiveModal title="Upload a thumbnail" open={open} onOpenChange={onOpenChange}>
			{/* <UploadDropzone
        endpoint="thumbnailUploader"
        input={{ videoId }}
        onClientUploadComplete={onUploadComplete}
      /> */}
			<h1>UPLOAD</h1>
		</ResponsiveModal>
	)
}
