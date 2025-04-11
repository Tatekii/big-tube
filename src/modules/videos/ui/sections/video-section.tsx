"use client";;
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";

import { VideoBanner } from "../components/video-banner";
import { VideoPlayer, VideoPlayerSkeleton } from "../components/video-player";
import { VideoTopRow, VideoTopRowSkeleton } from "../components/video-top-row";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth/api/useAuth";

interface VideoSectionProps {
  videoId: string;
}

export const VideoSection = ({ videoId }: VideoSectionProps) => {
  return (
    <Suspense fallback={<VideoSectionSkeleton />}>
      <ErrorBoundary fallback={<p>出错了</p>}>
        <VideoSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  )
};

export const VideoSectionSkeleton = () => {
  return (
    <>
      <VideoPlayerSkeleton />
      <VideoTopRowSkeleton />
    </>
  )
}

const VideoSectionSuspense = ({ videoId }: VideoSectionProps) => {
  const trpc = useTRPC();
  const { isSignedIn } = useAuth();

  const queryClient = useQueryClient();
  const {
    data: video
  } = useSuspenseQuery(trpc.videos.getOne.queryOptions({ id: videoId }));

  const createView = useMutation(trpc.videoViews.create.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.videos.getOne.queryFilter({ id: videoId }));
    },
  }));

  const handlePlay = () => {
    if (!isSignedIn) return;

    createView.mutate({ videoId });
  };

  return (
    <>
      <div className={cn(
        "aspect-video bg-black rounded-xl overflow-hidden relative",
        video.muxStatus !== "ready" && "rounded-b-none",
      )}>
        <VideoPlayer
          autoPlay
          onPlay={handlePlay}
          playbackId={video.muxPlaybackId}
          thumbnailUrl={video.thumbnailUrl}
        />
      </div>
      <VideoBanner status={video.muxStatus} />
      <VideoTopRow video={video} />
    </>
  )
};