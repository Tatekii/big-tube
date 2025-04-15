import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { users } from "@/db/schema";
import { getAuthUser } from "@/modules/auth/utils";

export const GET = async () => {
  const userId  = await getAuthUser();

  if (!userId) {
    return redirect("/sign-in");
  }
  
  const [existingUser] = await db
  .select()
  .from(users)
  .where(eq(users.id, userId));
  
  if (!existingUser) {
    return redirect("/sign-in");
  }

  return redirect(`/users/${existingUser.id}`);
};
