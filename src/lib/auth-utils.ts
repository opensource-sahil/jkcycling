import { auth } from "@/auth";

export async function isAdmin() {
  const session = await auth();
  if (!session?.user?.email) return false;
  
  const admins = (process.env.ADMIN_EMAILS || "").split(",");
  return admins.includes(session.user.email);
}

export async function requireAdmin() {
  const isAllowed = await isAdmin();
  if (!isAllowed) {
    throw new Error("Unauthorized Access");
  }
}
