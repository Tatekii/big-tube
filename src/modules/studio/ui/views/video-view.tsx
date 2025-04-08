import { StudioFormSection } from "../sections/form-section";



interface PageProps {
  videoId: string;
};

export const StudioVideoView = ({ videoId }: PageProps) => {
  return (
    <div className="px-4 pt-2.5 max-w-screen-lg mx-auto">
      <StudioFormSection videoId={videoId} />
    </div>
  );
};
