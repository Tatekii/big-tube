import { useState } from "react"
import { ListPlusIcon, MoreVerticalIcon,  Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PlaylistAddModal } from "@/modules/playlists/ui/components/playlist-add-modal"

interface VideoMenuProps {
	videoId: string
	variant?: "ghost" | "secondary"
	onRemove?: () => void
}

export const VideoMenu = ({ videoId, variant = "ghost", onRemove }: VideoMenuProps) => {
	const [isOpenPlaylistAddModal, setIsOpenPlaylistAddModal] = useState(false)



	return (
		<>
			<PlaylistAddModal
				videoId={videoId}
				open={isOpenPlaylistAddModal}
				onOpenChange={setIsOpenPlaylistAddModal}
			/>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant={variant} size="icon" className="rounded-full">
						<MoreVerticalIcon />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
					<DropdownMenuItem onClick={() => setIsOpenPlaylistAddModal(true)}>
						<ListPlusIcon className="mr-2 size-4" />
						添加到播放列表
					</DropdownMenuItem>
					{onRemove && (
						<DropdownMenuItem onClick={onRemove}>
							<Trash2Icon className="mr-2 size-4" />
							移除
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	)
}
