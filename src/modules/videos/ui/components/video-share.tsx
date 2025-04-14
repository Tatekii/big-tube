import { Button } from "@/components/ui/button"
import { APP_URL } from "@/trpc/constants"
import { ShareIcon } from "lucide-react"
import { FC } from "react"
import { toast } from "sonner"

interface VideoShareProps {
	videoId: string
}

const VideoShare: FC<VideoShareProps> = ({ videoId }) => {
	const onShare = () => {
		const fullUrl = `${APP_URL}/videos/${videoId}`
		navigator.clipboard.writeText(fullUrl)
		toast.success("Link copied to the clipboard")
	}

	return (
		<Button onClick={onShare} className="rounded-full" variant='secondary'>
			<ShareIcon className="mr-2 size-4" />
			分享
		</Button>
	)
}

export default VideoShare
