import { Router, type Request, type Response } from "express";
import * as response from "../response";
import * as generatePlanService from "../services/generate-plan.service";
import type { GeneratePlanRequestBody } from "../types";

const router = Router();

router.post("/generate-plan", async (req: Request, res: Response) => {
  try {
    const body = req.body as GeneratePlanRequestBody;
    const result = await generatePlanService.execute({
      lessonName: body.lessonName ?? "",
      step1: body.step1,
      step2: body.step2,
      step3: body.step3,
      step4: body.step4,
      step5: body.step5,
      subject: body.subject,
      grade: body.grade,
      userEmail: body.userEmail,
    });
    return response.success(res, result);
  } catch (err) {
    console.error("[POST /api/generate-plan]", err);
    const body = req.body as GeneratePlanRequestBody | undefined;
    const result = await generatePlanService.execute({
      lessonName: body?.lessonName ?? "",
      step1: body?.step1,
      step2: body?.step2,
      step3: body?.step3,
      step4: body?.step4,
      step5: body?.step5,
      subject: body?.subject,
      grade: body?.grade,
      userEmail: body?.userEmail,
    });
    return response.success(res, result);
  }
});

export default router;
