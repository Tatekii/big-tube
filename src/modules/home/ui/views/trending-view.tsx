import { TrendingVideosSection } from "../sections/trending-videos-section"

export const TrendingView = () => {
	return (
		<div className="max-w-[2400px] mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
			<div>
				<h1 className="text-2xl font-bold">当下流行</h1>
				<p className="text-xs text-muted-foreground">当下这些视频最为火热</p>
			</div>
			<TrendingVideosSection />
		</div>
	)
}
