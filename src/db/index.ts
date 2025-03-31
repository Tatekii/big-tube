import { drizzle } from "drizzle-orm/neon-http"
// import { neon } from "@neondatabase/serverless"
import * as schema from "@/db/schema"

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not defined")
}

let db: ReturnType<typeof drizzle<typeof schema>>

try {
	// const sql = neon(process.env.DATABASE_URL)

	db = drizzle(process.env.DATABASE_URL, {
		// db = drizzle({
		// client: sql,
		schema,
	})
} catch (error) {
	console.error("Failed to initialize database connection:", error)
	throw new Error("Database connection failed")
}

export { db }
