import type { PrismaClient } from "@prisma/client";

export interface CreateLessonPlanInput {
  userId: string;
  lessonName: string;
  subject?: string;
  grade?: string;
  step1?: string;
  step2?: string;
  step3?: string;
  step4?: string;
  step5?: string;
  finalMarkdown: string;
}

export async function create(
  prisma: PrismaClient,
  input: CreateLessonPlanInput
): Promise<{ id: string }> {
  const plan = await prisma.lessonPlan.create({
    data: {
      userId: input.userId,
      lessonName: input.lessonName,
      subject: input.subject,
      grade: input.grade,
      step1: input.step1,
      step2: input.step2,
      step3: input.step3,
      step4: input.step4,
      step5: input.step5,
      finalMarkdown: input.finalMarkdown,
    },
  });
  return { id: plan.id };
}
