import { auth } from "@/auth";

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

/** Email of the signed-in admin, or null when the visitor is not one. */
export async function getAdminEmail(): Promise<string | null> {
  const email = (await auth())?.user?.email?.toLowerCase();
  if (!email) return null;
  return adminEmails().includes(email) ? email : null;
}

export async function isAdmin(): Promise<boolean> {
  return (await getAdminEmail()) !== null;
}

/** Throws unless the caller is an admin. Returns their email for audit stamps. */
export async function requireAdmin(): Promise<string> {
  const email = await getAdminEmail();
  if (!email) throw new Error("Unauthorized Access");
  return email;
}
