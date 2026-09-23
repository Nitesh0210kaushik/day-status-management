import { Router } from "express";
import {
  csrf,
  login,
  logout,
  refresh,
  register,
} from "../controllers/auth.controller";
import {
  loginRateLimiter,
  registerRateLimiter,
} from "../middleware/rate-limit";

const authRouter = Router();

authRouter.get("/csrf", csrf);

authRouter.post("/register", registerRateLimiter, register);
authRouter.post("/login", loginRateLimiter, login);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);

export default authRouter;
