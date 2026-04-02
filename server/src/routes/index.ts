import { Router } from "express";
import { healthRouter } from "./health";

const apiRouter = Router();

apiRouter.use(healthRouter);

export { apiRouter };
