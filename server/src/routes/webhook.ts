// server/src/routes/webhook.ts
import { Router, Request, Response } from "express";
import crypto from "crypto";
import prisma from "../lib/prisma";

const router = Router();

function verifySignature(body: string, signatureHeader?: string) {
  const secret = process.env.SUPABASE_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(body);
  const expected = hmac.digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
}

router.post("/supabase", expressRawBody, async (req: Request, res: Response) => {
  // expressRawBody is a custom middleware to expose req.rawBody; we'll define usage below
  try {
    const signature = req.headers["x-supabase-signature"] as string | undefined;
    const raw = (req as any).rawBody as string;
    if (!verifySignature(raw, signature)) {
      return res.status(401).json({ message: "Invalid signature" });
    }

    const payload = req.body; // parsed JSON
    // handle deletion events
    if (payload?.type === "user.deleted" && payload.record?.id) {
      const supabaseId = payload.record.id as string;
      // either delete user or mark as disabled
      await prisma.user.updateMany({
        where: { supabaseId },
        data: { emailVerified: false, provider: null, providerId: null, supabaseId: null },
      });
      // or delete: await prisma.user.deleteMany({ where: { supabaseId } });
      return res.json({ ok: true });
    }

    // handle user.updated etc.
    if (payload?.type === "user.updated" && payload.record?.id) {
      const supabaseId = payload.record.id as string;
      await prisma.user.updateMany({
        where: { supabaseId },
        data: {
          email: payload.record.email ?? undefined,
          // additional mapping as needed
        },
      });
      return res.json({ ok: true });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ message: "Webhook processing error" });
  }
});

export default router;

/**
 * Middleware to capture raw body required for signature verification.
 * You must mount this before bodyParser.json for this route or use a conditional body parser.
 *
 * Example in server.ts:
 * app.post("/webhook/supabase", rawBodyMiddleware, webhookRouter);
 *
 * Implementation below provided for inclusion in your server bootstrap.
 */
