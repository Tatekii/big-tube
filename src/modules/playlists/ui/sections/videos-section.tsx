"use client";;
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { useTRPC } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";
import { InfiniteScroll } from "@/components/infinite-scroll";

import { VideoGridCard, VideoGridCardSkeleton } from "@/modules/videos/ui/components/video-grid-card";
import { VideoRowCard, VideoRowCardSkeleton } from "@/modules/videos/ui/components/video-row-card";
import { toast } from "sonner";

import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

interface VideosSectionProps {
  playlistId: string;
}

export const VideosSection = (props: VideosSectionProps) => {
  return (
    <Suspense fallback={<VideosSectionSkeleton />}>
      <ErrorBoundary fallback={<p>出错了</p>}>
        <VideosSectionSuspense {...props} />
      </ErrorBoundary>
    </Suspense>
  );
};

export const VideosSectionSkeleton = () => {
  return (
    <div>
      <div className="flex flex-col gap-4 gap-y-10 md:hidden">
        {Array.from({ length: 18 }).map((_, index) => (
            <VideoGridCardSkeleton key={index} />
          ))
        }
      </div>
      <div className="hidden flex-col gap-4 md:flex">
        {Array.from({ length: 18 }).map((_, index) => (
            <VideoRowCardSkeleton key={index} size="compact" />
          ))
        }
      </div>
    </div>
  )
}

const VideosSectionSuspense = ({ playlistId }: VideosSectionProps) => {
  const trpc = useTRPC();
  const query = useSuspenseInfiniteQuery(trpc.playlists.getVideos.infiniteQueryOptions(
    { limit: DEFAULT_LIMIT, playlistId },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  ));

  const videos = query.data;

  const queryClient = useQueryClient();

  const removeVideo = useMutation(trpc.playlists.removeVideo.mutationOptions({
    onSuccess: (data) => {
      toast.success("Video removed from playlist");
      queryClient.invalidateQueries(trpc.playlists.getMany.pathFilter());
      queryClient.invalidateQueries(trpc.playlists.getManyForVideo.queryFilter({ videoId: data.videoId }));
      queryClient.invalidateQueries(trpc.playlists.getOne.queryFilter({ id: data.playlistId }))
      queryClient.invalidateQueries(trpc.playlists.getVideos.queryFilter({ playlistId: data.playlistId }))
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  }));

  return (
    <>
      <div className="flex flex-col gap-4 gap-y-10 md:hidden">
        {videos.pages
          .flatMap((page) => page.items)
          .map((video) => (
            <VideoGridCard 
              key={video.id} 
              data={video} 
              onRemove={() => removeVideo.mutate({ playlistId, videoId: video.id })} />
          ))
        }
      </div>
      <div className="hidden flex-col gap-4 md:flex">
        {videos.pages
          .flatMap((page) => page.items)
          .map((video) => (
            <VideoRowCard 
              key={video.id} 
              data={video} 
              size="compact" 
              onRemove={() => removeVideo.mutate({ playlistId, videoId: video.id })}
            />
          ))
        }
      </div>
      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </>
  )
}