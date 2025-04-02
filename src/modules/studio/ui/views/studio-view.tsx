import { VideosSection } from "../sections/videos-section";

export const StudioView = () => {
  return ( 
    <div className="flex flex-col gap-y-6 pt-2.5">
      <div className="px-4">
        <h1 className="text-2xl font-bold">我的频道</h1>
        <p className="text-xs text-muted-foreground">
          管理你的视频与内容
        </p>
      </div>
      <VideosSection />
    </div>
  );
}
