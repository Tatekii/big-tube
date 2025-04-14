import { SubscriptionsSection } from "../sections/subscriptions-section"

export const SubscriptionsView = () => {
	return (
		<div className="max-w-screen-md mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
			<div>
				<h1 className="text-2xl font-bold">所有订阅</h1>
				<p className="text-xs text-muted-foreground">查看和管理您订阅的所有频道</p>
			</div>
			<SubscriptionsSection />
		</div>
	)
}
