import { toast } from "sonner";
import { Loader2Icon, SquareCheckIcon, SquareIcon } from "lucide-react";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/responsive-modal";
import { InfiniteScroll } from "@/components/infinite-scroll";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { DEFAULT_LIMIT } from "@/trpc/constants";

interface PlaylistAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoId: string;
}

export const PlaylistAddModal = ({
  open,
  onOpenChange,
  videoId
}: PlaylistAddModalProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { 
    data: playlists,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery(trpc.playlists.getManyForVideo.infiniteQueryOptions({
    limit: DEFAULT_LIMIT,
    videoId,
  }, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!videoId && open,
  }));

  const addVideo = useMutation(trpc.playlists.addVideo.mutationOptions({
    onSuccess: (data) => {
      toast.success("Video added to playlist");
      queryClient.invalidateQueries(trpc.playlists.getMany.pathFilter());
      queryClient.invalidateQueries(trpc.playlists.getManyForVideo.queryFilter({ videoId }));
      queryClient.invalidateQueries(trpc.playlists.getOne.queryFilter({ id: data.playlistId }))
      queryClient.invalidateQueries(trpc.playlists.getVideos.queryFilter({ playlistId: data.playlistId }))
    },
    onError: () => {
      toast.error("出错了，请稍后再试");
    },
  }));

  const removeVideo = useMutation(trpc.playlists.removeVideo.mutationOptions({
    onSuccess: (data) => {
      toast.success("Video removed from playlist");
      queryClient.invalidateQueries(trpc.playlists.getMany.pathFilter());
      queryClient.invalidateQueries(trpc.playlists.getManyForVideo.queryFilter({ videoId }));
      queryClient.invalidateQueries(trpc.playlists.getOne.queryFilter({ id: data.playlistId }))
      queryClient.invalidateQueries(trpc.playlists.getVideos.queryFilter({ playlistId: data.playlistId }))
    },
    onError: () => {
      toast.error("出错了，请稍后再试");
    },
  }));

  return (
    <ResponsiveModal
      title="Add to playlist"
      open={open}
      onOpenChange={onOpenChange}
    >
      <div className="flex flex-col gap-2">
        {isLoading && (
          <div className="flex justify-center p-4">
            <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {!isLoading &&
          playlists?.pages
            .flatMap((page) => page.items)
            .map((playlist) => (
              <Button 
                key={playlist.id}
                variant="ghost"
                className="w-full justify-start px-2 [&_svg]:size-5"
                size="lg"
                onClick={() => {
                  if (playlist.containsVideo) {
                    removeVideo.mutate({ playlistId: playlist.id, videoId })
                  } else {
                    addVideo.mutate({ playlistId: playlist.id, videoId })
                  }
                }}
                disabled={removeVideo.isPending || addVideo.isPending}
              >
                {playlist.containsVideo ? (
                  <SquareCheckIcon className="mr-2" />
                ) : (
                  <SquareIcon className="mr-2" />
                )}
                {playlist.name}
              </Button>
            ))
        }
        {!isLoading && (
          <InfiniteScroll
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
            isManual
          />
        )}
      </div>
    </ResponsiveModal>
  );
};
