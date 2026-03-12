import { z } from "zod";

// --- Request/response limits (anti-abuse) ---
const MAX_LESSON_NAME = 200;
const MAX_CHAT_HISTORY_LENGTH = 50;
const MAX_MESSAGE_LENGTH = 2000;

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().max(MAX_MESSAGE_LENGTH),
});

export const chatRequestBodySchema = z.object({
  lessonName: z.string().min(1).max(MAX_LESSON_NAME),
  currentStep: z.number().int().min(1).max(5),
  stepTurnCount: z.number().int().min(0).max(10),
  chatHistory: z.array(chatMessageSchema).max(MAX_CHAT_HISTORY_LENGTH),
  idempotencyKey: z.string().max(64).optional(),
});

export const chatResponseSchema = z.object({
  isStepComplete: z.boolean(),
  aiResponse: z.string(),
  suggestedOptions: z.array(z.string().max(150)).length(3),
});

export type ChatRequestBody = z.infer<typeof chatRequestBodySchema>;
export type ChatResponseBody = z.infer<typeof chatResponseSchema>;

/** Extract first JSON object or array from text (handles markdown code blocks / trailing text) */
export function extractJsonFromText(text: string): string | null {
  const trimmed = text.trim();
  const objectMatch = trimmed.match(/\{[\s\S]*?\}(?=\s*$|\s*[\],]|\s*$)/);
  if (objectMatch) return objectMatch[0];
  const arrayMatch = trimmed.match(/\[[\s\S]*?\](?=\s*$|\s*[\]])/);
  if (arrayMatch) return arrayMatch[0];
  const anyObject = trimmed.match(/\{[\s\S]*\}/);
  if (anyObject) return anyObject[0];
  const anyArray = trimmed.match(/\[[\s\S]*\]/);
  if (anyArray) return anyArray[0];
  return null;
}

export const DEFAULT_SAFE_CHAT_RESPONSE: ChatResponseBody = {
  isStepComplete: false,
  aiResponse:
    "Xin lỗi, tôi chưa xử lý được. Thầy/cô vui lòng thử lại hoặc chọn một gợi ý bên dưới.",
  suggestedOptions: ["Thử lại", "Bỏ qua bước này", "Liên hệ hỗ trợ"],
};
