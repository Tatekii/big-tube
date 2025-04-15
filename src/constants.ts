export const SIGN_IN_PATH = process.env.NEXT_PUBLIC_SIGN_IN_PATH || "/sign-in"
export const SIGN_UP_PATH = process.env.NEXT_PUBLIC_SIGN_UP_PATH || "/sign-up"

export const AVATAR_FALLBACK = `/user-placeholder.svg`
export const THUMBNAIL_FALLBACK = "/placeholder.svg"
// Crucial to modify in .env to production domain (including protocol)
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
