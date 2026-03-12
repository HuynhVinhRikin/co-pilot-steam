import type { PrismaClient } from "@prisma/client";

let _prisma: PrismaClient | null | undefined = undefined;

export async function getPrisma(): Promise<PrismaClient | null> {
  if (!process.env.DATABASE_URL) return null;
  if (_prisma !== undefined) return _prisma;
  try {
    const { prisma } = await import("../lib/prisma");
    _prisma = prisma;
    return prisma;
  } catch {
    _prisma = null;
    return null;
  }
}
