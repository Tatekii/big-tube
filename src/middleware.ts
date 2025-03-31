import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getAuthUser } from "@/modules/auth/utils"

// Define protected and public routes
const PROTECTED_PATHS = ["/home", "/studio", "/subscriptions", "/feed/subscribed", "/playlists", "/settings"]

function isProtectedRoute(pathname: string): boolean {
	return PROTECTED_PATHS.some((path) => pathname.startsWith(path))
}

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl
	const userId = await getAuthUser()

	// Skip Next.js static files
	if (
		pathname.includes("/_next") ||
		pathname.includes("/api") ||
		pathname.match(/\.(?:jpg|jpeg|gif|png|svg|ico|css|js)$/)
	) {
		return NextResponse.next()
	}

	// Redirect unauthenticated users to login for protected routes
	if (!userId && isProtectedRoute(pathname)) {
		const loginUrl = new URL("/sign-in", request.url)
		// loginUrl.searchParams.set("callbackUrl", pathname)
		return NextResponse.redirect(loginUrl)
	}

	return NextResponse.next()
}

export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		// Always run for API routes
		"/(api|trpc)(.*)",
	],
}
