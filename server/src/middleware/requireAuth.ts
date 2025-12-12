// server/src/middleware/requireAuth.ts
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.ts";
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient()
export interface AuthedRequest extends Request {
  user?: { id: string; email?: string; [key: string]: any };
}

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken = (req.cookies && req.cookies.token) || undefined;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : cookieToken;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: token missing" });
    }

    const decoded = verifyToken(token as string);
    if (!decoded || typeof decoded === "string") {
      return res.status(401).json({ message: "Unauthorized: invalid token" });
    }

    // decoded should be the payload you signed (e.g. { userId, ... })
    // load user for convenience (optional — reduces DB hits in downstream routes)
    const userId = (decoded as any).userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = { id: user.id, email: user.email, firstName: user.firstName, username: user.username };
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ message: "Unauthorized" });
  }
}
