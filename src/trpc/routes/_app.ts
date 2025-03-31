// import { usersRouter } from "@/modules/users/server/procedures"
import { authRouter } from "@/modules/auth/service/procedures"

import { createTRPCRouter } from "../init"

export const appRouter = createTRPCRouter({
	// users: usersRouter,
	auth: authRouter,
})
// export type definition of API
export type AppRouter = typeof appRouter
