import { signIn, signOut, auth } from "@/auth"
import Image from "next/image"

export default async function AuthButton() {
  const session = await auth()

  if (!session?.user) {
    return (
      <form
        action={async () => {
          "use server"
          await signIn("google")
        }}
      >
        <button className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
          Sign In
        </button>
      </form>
    )
  }

  return (
    <div className="flex items-center gap-4">
      {session.user.image && (
        <Image
          src={session.user.image}
          alt={session.user.name || "User"}
          width={32}
          height={32}
          className="rounded-full border border-gray-200"
          style={{ objectFit: 'cover' }}
        />
      )}
      <form
        action={async () => {
          "use server"
          await signOut()
        }}
      >
        <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
          Sign Out
        </button>
      </form>
    </div>
  )
}
