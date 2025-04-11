import { useTRPC } from "@/trpc/client";
import { UploadDropzone } from "@/lib/uploadthing";
import { ResponsiveModal } from "@/components/responsive-modal";

import { useQueryClient } from "@tanstack/react-query";

interface BannerUploadModalProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BannerUploadModal = ({
  userId,
  open,
  onOpenChange,
}: BannerUploadModalProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const onUploadComplete = () => {
    queryClient.invalidateQueries(trpc.users.getOne.queryFilter({ id: userId }));
    onOpenChange(false);
  };

  return (
    <ResponsiveModal
      title="Upload a banner"
      open={open}
      onOpenChange={onOpenChange}
    >
      <UploadDropzone
        endpoint="bannerUploader"
        onClientUploadComplete={onUploadComplete}
      />
    </ResponsiveModal>
  );
};
