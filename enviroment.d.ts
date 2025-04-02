declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NEXT_PUBLIC_APP_URL: string
			DATABASE_URL: string
			NEXT_PUBLIC_SIGN_IN_PATH: string
			NEXT_PUBLIC_SIGN_UP_PATH: string
			JWT_SECRET: string
			MUX_TOKEN_ID: string
			MUX_TOKEN_SECRET: string
		}
	}
}
export {}
