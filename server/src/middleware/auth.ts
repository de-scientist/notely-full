import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.ts';

const TOKEN_COOKIE_NAME = 'token';

export function attachUser(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[TOKEN_COOKIE_NAME];
  if (!token) {
    return next();
  }

  const payload = verifyToken(token);
  if (payload) {
    req.user = { id: payload.userId };
  }

  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  return next();
}
