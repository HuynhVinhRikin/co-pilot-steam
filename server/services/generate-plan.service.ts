import { GUEST_EMAIL, DEFAULT_SUBJECT } from "../config/constants";
import { getPrisma } from "../database";
import * as userRepository from "../repositories/user.repository";
import * as lessonPlanRepository from "../repositories/lesson-plan.repository";
import * as gemini from "./gemini.service";
import * as grok from "./grok.service";

function getMockPlan(
  lessonName: string,
  s1?: string,
  s2?: string,
  s3?: string,
  s4?: string,
  s5?: string
): string {
  return `# Kế hoạch bài dạy: ${lessonName}

## 1. Mục tiêu
- HS nắm được kiến thức cơ bản và vận dụng STEAM.
- Phát triển năng lực tư duy và giải quyết vấn đề.

## 2. Chuẩn bị
- Giáo viên: Giáo án, thiết bị thí nghiệm.
- Học sinh: Vở, dụng cụ theo yêu cầu.

## 3. Thấu cảm (Empathize)
${s1 ?? "—"}

## 4. Xác định vấn đề (Define)
${s2 ?? "—"}

## 5. Ý tưởng STEAM (Ideate)
${s3 ?? "—"}

## 6. Nguyên mẫu (Prototype)
${s4 ?? "—"}

## 7. Thử nghiệm & đánh giá (Test)
${s5 ?? "—"}

---
*Giáo án được tạo bởi AI Co-pilot STEAM.*
`;
}

export interface GeneratePlanInput {
  lessonName: string;
  step1?: string;
  step2?: string;
  step3?: string;
  step4?: string;
  step5?: string;
  subject?: string;
  grade?: string;
  userEmail?: string;
}

export interface GeneratePlanResult {
  markdown: string;
  lessonPlanId?: string;
}

export async function execute(input: GeneratePlanInput): Promise<GeneratePlanResult> {
  const lessonName = input.lessonName.trim() || DEFAULT_SUBJECT;
  const { step1, step2, step3, step4, step5, subject, grade, userEmail } = input;

  let markdown: string;
  let fromAi = null;
  //  await gemini.getMarkdownFromGemini(
  //   lessonName,
  //   step1,
  //   step2,
  //   step3,
  //   step4,
  //   step5
  // );
  if (!fromAi) {
    fromAi = await grok.getMarkdownFromGrok(
      lessonName,
      step1,
      step2,
      step3,
      step4,
      step5
    );
  }
  if (fromAi) {
    markdown = fromAi;
  } else {
    markdown = getMockPlan(lessonName, step1, step2, step3, step4, step5);
  }

  let lessonPlanId: string | undefined;
  const prisma = await getPrisma();
  if (prisma) {
    try {
      const email =
        typeof userEmail === "string" && userEmail.trim()
          ? userEmail.trim()
          : GUEST_EMAIL;
      const user = await userRepository.findOrCreateByEmail(prisma, email);
      const plan = await lessonPlanRepository.create(prisma, {
        userId: user.id,
        lessonName,
        subject,
        grade,
        step1,
        step2,
        step3,
        step4,
        step5,
        finalMarkdown: markdown,
      });
      lessonPlanId = plan.id;
    } catch (dbErr) {
      console.error("[generate-plan.service] DB save", dbErr);
    }
  }

  return lessonPlanId ? { markdown, lessonPlanId } : { markdown };
}
