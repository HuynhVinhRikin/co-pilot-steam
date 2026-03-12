import { Router } from "express";
import suggestionsRouter from "./suggestions.routes";
import generatePlanRouter from "./generate-plan.routes";

const apiRouter = Router();

apiRouter.use("/api", suggestionsRouter);
apiRouter.use("/api", generatePlanRouter);

export default apiRouter;
