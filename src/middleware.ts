import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getAuthUser } from "@/modules/auth/utils"
import { SIGN_IN_PATH } from "./constants"

// 受保护路由
const PROTECTED_PATHS = ["/studio", "/subscriptions", "/feed/subscribed", "/playlists", "/settings"]

const SIGN_PATHS = ["/sign-in", "/sign-up"]

function isProtectedRoute(pathname: string): boolean {
	return PROTECTED_PATHS.some((path) => pathname.startsWith(path))
}
function isSignRoute(pathname: string): boolean {
	return SIGN_PATHS.some((path) => pathname.startsWith(path))
}


export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl

	const userId = await getAuthUser()

	// Skip Next.js static files
	if (pathname.includes("/_next") || pathname.match(/\.(?:jpg|jpeg|gif|png|svg|ico|css|js)$/)) {
		return NextResponse.next()
	}

	if(userId && isSignRoute(pathname)){
		return NextResponse.redirect(new URL('/', request.url))
	}

	// Redirect unauthenticated users to login for protected routes
	if (!userId && isProtectedRoute(pathname)) {
		const loginUrl = new URL(SIGN_IN_PATH, request.url)
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
