import { Router } from "express";
import {
  csrf,
  login,
  logout,
  me,
  refresh,
  register,
} from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";
import {
  loginRateLimiter,
  registerRateLimiter,
} from "../middleware/rate-limit";

const authRouter = Router();

authRouter.get("/csrf", csrf);

authRouter.post("/register", registerRateLimiter, register);
authRouter.post("/login", loginRateLimiter, login);
authRouter.get("/me", requireAuth, me);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);

export default authRouter;
