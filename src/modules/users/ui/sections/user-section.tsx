"use client";;
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { useTRPC } from "@/trpc/client";
import { Separator } from "@/components/ui/separator";

import { UserPageInfo, UserPageInfoSkeleton } from "../components/user-page-info";
import { UserPageBanner, UserPageBannerSkeleton } from "../components/user-page-banner";

import { useSuspenseQuery } from "@tanstack/react-query";

interface UserSectionProps {
  userId: string;
}

export const UserSection = (props: UserSectionProps) => {
  return (
    <Suspense fallback={<UserSectionSkeleton />}>
      <ErrorBoundary fallback={<p>出错了</p>}>
        <UserSectionSuspense {...props} />
      </ErrorBoundary>
    </Suspense>
  );
};

export const UserSectionSkeleton = () => {
  return (
    <div className="flex flex-col">
      <UserPageBannerSkeleton />
      <UserPageInfoSkeleton />
      <Separator />
    </div>
  );
};

const UserSectionSuspense = ({ userId }: UserSectionProps) => {
  const trpc = useTRPC();
  const {
    data: user
  } = useSuspenseQuery(trpc.users.getOne.queryOptions({ id: userId }));

  return (
    <div className="flex flex-col">
      <UserPageBanner user={user} />
      <UserPageInfo user={user} />
      <Separator />
    </div>
  );
};

