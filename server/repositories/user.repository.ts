import type { PrismaClient } from "@prisma/client";

export async function findOrCreateByEmail(
  prisma: PrismaClient,
  email: string,
  role = "teacher"
) {
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: { email, role },
    });
  }
  return user;
}
