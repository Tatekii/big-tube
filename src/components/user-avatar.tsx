import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage } from "@/components/ui/avatar"

const avatarVariants = cva("overflow-hidden", {
  variants: {
    size: {
      default: "h-9 w-9",
      xs: "h-4 w-4",
      sm: "h-6 w-6",
      lg: "h-10 w-10",
      xl: "h-[160px] w-[160px]",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

interface UserAvatarProps extends VariantProps<typeof avatarVariants>, 
  React.ComponentPropsWithoutRef<typeof Avatar> {
  imageUrl: string
  name: string
  className?: string
  onClick?: () => void
}

export const UserAvatar = ({ imageUrl, name, size, className, onClick }: UserAvatarProps) => {
  return (
    <Avatar className={cn(avatarVariants({ size, className }))} onClick={onClick}>
        <AvatarImage 
          src={imageUrl} 
          alt={name} 
          className="object-cover"
        />
    </Avatar>
  )
}
