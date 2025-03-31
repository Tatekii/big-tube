import { Separator } from "@/components/ui/separator"
import { Sidebar, SidebarContent, SidebarGroupLabel } from "@/components/ui/sidebar"

import { MainSection } from "./main-section"
import { PersonalSection } from "./personal-section"

import { SignedIn } from "@/modules/auth/components/auth-wrapper"

export const HomeSidebar = () => {
	return (
		<Sidebar className="pt-16 z-40 border-none" collapsible="icon">
			<SidebarContent className="bg-background">
				<MainSection />
				<Separator />
				<PersonalSection />
				<SignedIn>
					<>
						<Separator />
						<SidebarGroupLabel>订阅</SidebarGroupLabel>
					</>
				</SignedIn>
			</SidebarContent>
		</Sidebar>
	)
}
