import { Router, type Request, type Response } from "express";
import * as response from "../response";
import * as suggestionsService from "../services/suggestions.service";
import type { SuggestionsRequestBody } from "../types";

const router = Router();

router.post("/suggestions", async (req: Request, res: Response) => {
  try {
    const body = req.body as SuggestionsRequestBody;
    const lessonName = typeof body.lessonName === "string" ? body.lessonName : "";
    const step = typeof body.step === "number" && body.step >= 1 && body.step <= 5 ? body.step : 1;
    const suggestions = await suggestionsService.getSuggestions(lessonName, step);
    return response.success(res, { suggestions });
  } catch (err) {
    console.error("[POST /api/suggestions]", err);
    const body = req.body as SuggestionsRequestBody | undefined;
    const lessonName = typeof body?.lessonName === "string" ? body.lessonName : "";
    const step = typeof body?.step === "number" && body.step >= 1 && body.step <= 5 ? body.step : 1;
    const suggestions = await suggestionsService.getSuggestions(lessonName, step);
    return response.success(res, { suggestions });
  }
});

export default router;
