import { MOCK_SUGGESTIONS, DEFAULT_LESSON_NAME } from "../config/constants";
import * as gemini from "./gemini.service";
import * as grok from "./grok.service";

function getMockSuggestions(lessonName: string, step: number): string[] {
  const arr = MOCK_SUGGESTIONS[step] ?? ["Gợi ý 1", "Gợi ý 2", "Gợi ý 3"];
  return arr.map((s) => s.replace("{lessonName}", lessonName));
}

export async function getSuggestions(
  lessonName: string,
  step: number
): Promise<string[]> {
  const name = lessonName.trim() || DEFAULT_LESSON_NAME;
  const stepNum = step >= 1 && step <= 5 ? step : 1;
  let result 

  // let result = await gemini.getSuggestionsFromGemini(name, stepNum);
  // if (result && result.length > 0) return result;
  result = await grok.getSuggestionsFromGrok(name, stepNum);
  if (result && result.length > 0) return result;
  return getMockSuggestions(name, stepNum);
}
