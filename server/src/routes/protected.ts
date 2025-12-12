// server/src/routes/protected.ts
import { Router } from "express";
import { requireAuth, AuthedRequest } from "../middleware/requireAuth.ts";

const router = Router();

router.get("/profile", requireAuth, async (req: AuthedRequest, res) => {
  // req.user is present
  return res.json({ user: req.user });
});

export default router;
