// import { usersRouter } from "@/modules/users/server/procedures"
import { authRouter } from "@/modules/auth/service/procedures"
import { categoriesRouter } from "@/modules/categories/server/procedures"
import { studioRouter } from "@/modules/studio/server/procedures"

import { createTRPCRouter } from "../init"
import { videosRouter } from "@/modules/videos/server/procedures"

export const appRouter = createTRPCRouter({
	// users: usersRouter,
	auth: authRouter,
	categories: categoriesRouter,
	studio: studioRouter,
	videos: videosRouter
})
// export type definition of API
export type AppRouter = typeof appRouter
