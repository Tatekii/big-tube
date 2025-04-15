import { UserAvatar } from "@/components/user-avatar"
import { UploadButton } from "@/lib/uploadthing"
import { useState } from "react"
import { toast } from "sonner"
import { useTRPC } from "@/trpc/client"
import { AVATAR_FALLBACK } from "@/constants"
import { useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"

interface AvatarUploadProps {
	imageUrl?: string | null
	name: string
	size?: "sm" | "lg" | "xl"
	className?: string
	userId: string
}

export function UserAvatarUploader({ imageUrl, name, size = "lg", className, userId }: AvatarUploadProps) {
	const [isHovering, setIsHovering] = useState(false)

	const trpc = useTRPC()

	const queryClient = useQueryClient()

	// const updateUser = useMutation(
	// 	trpc.auth.update.mutationOptions({
	// 		onSuccess: () => {
	// 			queryClient.invalidateQueries(trpc.auth.current.pathFilter())

	// 			toast.success("头像已更新")
	// 		},
	// 		onError: () => {
	// 			toast.error("更新头像失败")
	// 		},
	// 	})
	// )

	const onAvatarUploaded = () => {
		queryClient.invalidateQueries(trpc.users.getOne.queryOptions({ id: userId }))

		toast.success("头像已更新")
	}

	// const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
	// 	const file = e.target.files?.[0]
	// 	if (!file) return

	// 	try {
	// 		const [res] = await startUpload([file])
	// 		if (res) {
	// 			await updateUser.mutateAsync({ imageUrl: res.url })
	// 		}
	// 	} catch (error) {
	// 		toast.error("上传失败")
	// 	}
	// }

	const cls = cn(
		"absolute w-full h-full inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer",
		!isHovering && "opacity-0"
	)

	return (
		<div
			className="relative rounded-full"
			onMouseEnter={() => setIsHovering(true)}
			onMouseLeave={() => isHovering && setIsHovering(false)}
		>
			<UserAvatar size={size} imageUrl={imageUrl || AVATAR_FALLBACK} name={name} className={className} />

			<div className={cls}>
				<UploadButton
					endpoint="avatarUploader"
					onClientUploadComplete={(res) => {
						// Do something with the response
						// console.log("Files: ", res)
						// alert("Upload Completed")
						onAvatarUploaded()
					}}
					onUploadError={(error: Error) => {
						// Do something with the error.
						toast.error("更换头像失败")
					}}
				/>
			</div>
		</div>
	)
}
