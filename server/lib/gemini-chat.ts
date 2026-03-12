import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  chatResponseSchema,
  extractJsonFromText,
  DEFAULT_SAFE_CHAT_RESPONSE,
  type ChatResponseBody,
} from "./chat-schemas";

const STEP_NAMES: Record<number, string> = {
  1: "Thấu cảm (Empathize)",
  2: "Xác định vấn đề (Define)",
  3: "Ý tưởng STEAM (Ideate)",
  4: "Tạo nguyên mẫu (Prototype)",
  5: "Thử nghiệm (Test)",
};

export function getGeminiChatClient(): GoogleGenerativeAI | null {
  const key = process.env.GEMINI_API_KEY;
  return key ? new GoogleGenerativeAI(key) : null;
}

export async function runAiGatekeeper(params: {
  lessonName: string;
  currentStep: number;
  stepTurnCount: number;
  chatHistory: Array<{ role: string; content: string }>;
}): Promise<ChatResponseBody> {
  const genAI = getGeminiChatClient();
  if (!genAI) return DEFAULT_SAFE_CHAT_RESPONSE;

  const stepName = STEP_NAMES[params.currentStep] ?? `Bước ${params.currentStep}`;
  const historyStr = params.chatHistory
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const prompt = `Bạn là chuyên gia sư phạm Vật lí, đóng vai AI Gatekeeper cho bài học STEAM.
Bài học: ${params.lessonName}
Bước hiện tại: ${stepName} (lần hỏi thứ ${params.stepTurnCount + 1}/2 trong bước này).

Lịch sử chat gần nhất:
${historyStr}

Nhiệm vụ: Đánh giá câu trả lời cuối của giáo viên và trả về ĐÚNG MỘT JSON sau (không markdown, không giải thích thêm):
{
  "isStepComplete": true hoặc false,
  "aiResponse": "Một câu phản hồi ngắn bằng tiếng Việt (gợi ý hoặc xác nhận chuyển bước)",
  "suggestedOptions": ["Gợi ý 1 ngắn", "Gợi ý 2 ngắn", "Gợi ý 3 ngắn"]
}

Quy tắc:
- Nếu câu trả lời đã đủ ý cho bước này HOẶC đây là lần hỏi thứ 2 trong bước → isStepComplete: true.
- suggestedOptions: mỗi chuỗi dưới 15 từ, phù hợp bước ${stepName}.
Trả về duy nhất JSON hợp lệ.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response?.text()?.trim() ?? "";
    const jsonStr = extractJsonFromText(text);
    if (!jsonStr) return DEFAULT_SAFE_CHAT_RESPONSE;

    const parsed = JSON.parse(jsonStr) as unknown;
    const validated = chatResponseSchema.safeParse(parsed);
    if (validated.success) return validated.data;
    return DEFAULT_SAFE_CHAT_RESPONSE;
  } catch {
    return DEFAULT_SAFE_CHAT_RESPONSE;
  }
}
