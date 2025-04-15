import { authRouter } from "@/modules/auth/service/procedures"
import { categoriesRouter } from "@/modules/categories/server/procedures"
import { studioRouter } from "@/modules/studio/server/procedures"

import { createTRPCRouter } from "../init"
import { videosRouter } from "@/modules/videos/server/procedures"
import { usersRouter } from "@/modules/users/service/procedures"
import { suggestionsRouter } from "@/modules/suggestions/server/procedures"
import { videoViewsRouter } from "@/modules/video-views/server/procedures"
import { playlistsRouter } from "@/modules/playlists/server/procedures"
import { videoReactionsRouter } from "@/modules/video-reactions/server/procedures"
import { subscriptionsRouter } from "@/modules/subscriptions/server/procedures"
import { commentsRouter } from "@/modules/comments/server/procedures"
import { commentReactionsRouter } from "@/modules/comment-reactions/server/procedures"
import { searchRouter } from "@/modules/search/server/procedures"

export const appRouter = createTRPCRouter({
	users: usersRouter,
	auth: authRouter,
	categories: categoriesRouter,
	studio: studioRouter,
	videos: videosRouter,
	suggestions: suggestionsRouter,
	videoViews: videoViewsRouter,
	playlists: playlistsRouter,
	videoReactions: videoReactionsRouter,
	subscriptions: subscriptionsRouter,
	comments: commentsRouter,
	commentReactions: commentReactionsRouter,
	search: searchRouter,
})
// export type definition of API
export type AppRouter = typeof appRouter
