import { Router } from "express";
import {
  getMonthStatuses,
  getStatus,
  upsertStatus,
} from "../controllers/day-status.controller";
import { requireAuth } from "../middleware/auth.middleware";

const dayStatusRouter = Router();

dayStatusRouter.get("/", getMonthStatuses);
dayStatusRouter.get("/:date", getStatus);
dayStatusRouter.put("/:date", requireAuth, upsertStatus);

export default dayStatusRouter;
