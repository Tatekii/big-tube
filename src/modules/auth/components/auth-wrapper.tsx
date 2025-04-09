"use server"
import { getAuthUser } from "@/modules/auth/utils"

interface AuthProps {
  children: React.ReactNode
}

export async function SignedIn({ children }: AuthProps) {
  const userId = await getAuthUser()
  
  if (!userId) {
    return null
  }
  
  return <>{children}</>
}

export async function SignedOut({ children }: AuthProps) {
  const userId = await getAuthUser()
  
  if (userId) {
    return null
  }
  
  return <>{children}</>
}