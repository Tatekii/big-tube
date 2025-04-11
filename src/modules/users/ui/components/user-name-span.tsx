import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

const userInfoVariants = cva("flex items-center gap-1", {
	variants: {
		size: {
			default: "[&_p]:text-sm [&_svg]:size-4",
			lg: "[&_p]:text-base [&_svg]:size-5 [&_p]:font-medium",
			sm: "[&_p]:text-xs [&_svg]:size-3.5",
		},
	},
	defaultVariants: {
		size: "default",
	},
})

interface UserNameSpanProps extends VariantProps<typeof userInfoVariants> {
	name: string
	className?: string
}

export const UserNameSpan = ({ name, className, size }: UserNameSpanProps) => {
	return (
		<div className={cn(userInfoVariants({ size, className }))}>
			<Tooltip>
				<TooltipTrigger asChild>
					<p className="line-clamp-1 hover:opacity-80">{name}</p>
				</TooltipTrigger>
				<TooltipContent align="center" className="bg-black/70 dark:bg-white/70">
					<p>{name}</p>
				</TooltipContent>
			</Tooltip>
		</div>
	)
}
