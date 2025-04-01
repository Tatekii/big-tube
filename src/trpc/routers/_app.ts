// import { usersRouter } from "@/modules/users/server/procedures"
import { authRouter } from "@/modules/auth/service/procedures"
import { categoriesRouter } from "@/modules/categories/server/procedures"

import { createTRPCRouter } from "../init"

export const appRouter = createTRPCRouter({
	// users: usersRouter,
	auth: authRouter,
	categories: categoriesRouter,
})
// export type definition of API
export type AppRouter = typeof appRouter
