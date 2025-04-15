"use client";;
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { useTRPC } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/trpc/constants";
import { InfiniteScroll } from "@/components/infinite-scroll";

import { VideoGridCard, VideoGridCardSkeleton } from "@/modules/videos/ui/components/video-grid-card";

import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

interface VideosSectionProps {
  userId: string;
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
    <div className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 18 }).map((_, index) => (
            <VideoGridCardSkeleton key={index} />
          ))
        }
      </div>
  )
}

const VideosSectionSuspense = ({ userId }: VideosSectionProps) => {
  const trpc = useTRPC();
  const query = useSuspenseInfiniteQuery(trpc.videos.getMany.infiniteQueryOptions(
    { userId, limit: DEFAULT_LIMIT },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  ));

  const videos = query.data;

  return (
    <div>
      <div className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
        {videos.pages
          .flatMap((page) => page.items)
          .map((video) => (
            <VideoGridCard key={video.id} data={video} />
          ))
        }
      </div>
      <InfiniteScroll
        hasNextPage={query.hasNextPage}
        isFetchingNextPage={query.isFetchingNextPage}
        fetchNextPage={query.fetchNextPage}
      />
    </div>
  )
}