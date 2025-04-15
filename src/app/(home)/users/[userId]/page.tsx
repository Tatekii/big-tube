import { DEFAULT_LIMIT } from "@/trpc/constants"
import { HydrateClient, prefetch, trpc } from "@/trpc/server"

import { UserView } from "@/modules/users/ui/views/user-view"

interface PageProps {
	params: Promise<{
		userId: string
	}>
}

const UsersIdPage = async ({ params }: PageProps) => {
	const { userId } = await params

	prefetch(trpc.users.getOne.queryOptions({ id: userId }))

	prefetch(trpc.videos.getMany.infiniteQueryOptions({ userId, limit: DEFAULT_LIMIT }))

	return (
		<HydrateClient>
			<UserView userId={userId} />
		</HydrateClient>
	)
}

export default UsersIdPage
