import type { Session } from "next-auth";

/**
 * Get current session. Wire this to your NextAuth v5 setup.
 * Example: export async function getSession() { return await auth(); }
 */
export async function getSession(): Promise<Session | null> {
  try {
    const { getServerSession } = await import("next-auth");
    const mod = await import("@/app/api/auth/[...nextauth]/route").catch(
      () => null
    );
    const authOptions = mod?.authOptions ?? null;
    if (!authOptions) return null;
    return getServerSession(authOptions);
  } catch {
    return null;
  }
}
