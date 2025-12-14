// server/src/routes/webhook.ts
import { Router, Request, Response } from "express";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

/**
 * Verifies HMAC-SHA256 signature coming from Supabase webhook.
 * Accepts the raw body string and the header value.
 */
function verifySignature(rawBody: string, signatureHeader?: string) {
  const secret = process.env.SUPABASE_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(rawBody);
  const expected = hmac.digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signatureHeader),
    );
  } catch {
    return false;
  }
}

/**
 * POST /webhook/supabase
 *
 * IMPORTANT: You must ensure a raw-body middleware has been run before this handler,
 * or that your Express setup correctly handles access to the raw request body string.
 */
router.post("/supabase", async (req: Request, res: Response) => {
  try {
    // Prefer rawBody if your server captured it; otherwise stringify parsed body
    // NOTE: Relying on JSON.stringify is risky for signature verification!
    const raw = (req as any).rawBody ?? JSON.stringify(req.body);
    // Cast header to string or undefined
    const signature =
      (req.headers["x-supabase-signature"] as string) ?? undefined;

    // Verify signature
    if (!verifySignature(raw, signature)) {
      return res.status(401).json({ message: "Invalid signature" });
    }

    const payload = req.body;

    // Example: handle Supabase auth events
    if (payload?.type === "user.deleted" && payload.record?.id) {
      const supabaseId = String(payload.record.id);

      // FIX: Delete the user record. This is the only clean way when supabaseId is required/unique.
      await prisma.user.deleteMany({ where: { supabaseId } });

      return res.json({ ok: true });
    }

    // Example: user.updated event
    if (payload?.type === "user.updated" && payload.record?.id) {
      const supabaseId = String(payload.record.id);

      // Map fields sensibly — only update fields that exist in the record
      await prisma.user.updateMany({
        where: { supabaseId },
        data: {
          email: payload.record.email ?? undefined,
          // expand mapping as needed (firstName/lastName etc) depending on payload shape
        },
      });

      return res.json({ ok: true });
    }

    // Unknown event: return ok (or log it)
    return res.json({ ok: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return res.status(500).json({ message: "Webhook processing error" });
  }
});

export default router;
