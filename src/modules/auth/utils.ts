import { compare, hash } from "bcryptjs"
import { cookies } from "next/headers"
import { signJWT, verifyJWT } from "@/lib/jwt"
import { AUTH_COOKIE, SALT_ROUNDS } from "./constants"

export async function hashPassword(password: string): Promise<string> {
	return hash(password, SALT_ROUNDS)
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
	return compare(password, hashedPassword)
}

export async function setAuthCookie(userId: string): Promise<void> {
	const token = await signJWT({ sub: userId })
	;(await cookies()).set(AUTH_COOKIE, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: 60 * 60 * 24, // 24 hours
	})
}

export async function getAuthUser(): Promise<string | null> {
	const token = (await cookies()).get(AUTH_COOKIE)?.value
	if (!token) return null

	try {
		const payload = await verifyJWT(token)
		return payload.sub
	} catch {
		return null
	}
}

export async function removeAuthCookie(): Promise<void> {
	;(await cookies()).delete(AUTH_COOKIE)
}
