import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { NuqsAdapter } from "nuqs/adapters/next/app"

import "./globals.css"
import { TRPCReactProvider } from "@/trpc/client"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
	title: "Create Next App",
	description: "Generated by create next app",
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange >
					<TRPCReactProvider>
						<Toaster />
						<NuqsAdapter>{children}</NuqsAdapter>
					</TRPCReactProvider>
				</ThemeProvider>
			</body>
		</html>
	)
}
