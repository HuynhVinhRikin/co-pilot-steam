import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "../config/config-base";
import { STEP_NAMES } from "../config/constants";

let _client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI | null {
  if (!config.GEMINI_API_KEY) return null;
  if (!_client) _client = new GoogleGenerativeAI(config.GEMINI_API_KEY);
  return _client;
}

function extractJsonArray(text: string): string[] | null {
  const trimmed = text.trim();
  const match = trimmed.match(/\[[\s\S]*?\]/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]) as unknown;
    return Array.isArray(parsed) ? (parsed as string[]).slice(0, 3) : null;
  } catch {
    return null;
  }
}

export async function getSuggestionsFromGemini(
  lessonName: string,
  step: number
): Promise<string[] | null> {
  const client = getClient();
  if (!client) return null;
  const stepName = STEP_NAMES[step] ?? `Bước ${step}`;
  const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Bạn là chuyên gia sư phạm Vật lí. Bài học là: ${lessonName}. Đang ở bước: ${stepName}. Hãy gợi ý 3 ý tưởng ngắn gọn (dưới 15 chữ mỗi ý) để giáo viên trả lời. Trả về đúng định dạng mảng JSON ["ý 1", "ý 2", "ý 3"], không kèm markdown hay text giải thích.`;
  const result = await model.generateContent(prompt);
  const text = result.response?.text()?.trim() ?? "";
  return extractJsonArray(text);
}

export async function getMarkdownFromGemini(
  lessonName: string,
  step1?: string,
  step2?: string,
  step3?: string,
  step4?: string,
  step5?: string
): Promise<string | null> {
  const client = getClient();
  if (!client) return null;
  const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Bạn là chuyên gia giáo dục STEAM. Hãy viết một Kế hoạch bài dạy (Giáo án) định dạng Markdown cho môn Vật lí.

Tên bài: ${lessonName}

Khó khăn của HS (Thấu cảm): ${step1 ?? "—"}

Vấn đề thực tiễn: ${step2 ?? "—"}

Yếu tố STEAM: ${step3 ?? "—"}

Nguyên mẫu cần chế tạo: ${step4 ?? "—"}

Tiêu chí đánh giá: ${step5 ?? "—"}

Hãy trình bày khoa học, có các mục tiêu, chuẩn bị, và tiến trình rõ ràng.`;
  const result = await model.generateContent(prompt);
  return result.response?.text()?.trim() ?? null;
}
