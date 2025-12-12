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
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}

/**
 * POST /webhook/supabase
 *
 * IMPORTANT:
 * - For best security, add a raw-body middleware that stores the request body string as req.rawBody
 *   (see server.ts rawBodyMiddleware example). This route will prefer req.rawBody but will fall
 *   back to JSON.stringify(req.body) if rawBody is not available.
 */
router.post("/supabase", async (req: Request, res: Response) => {
  try {
    // Prefer rawBody if your server captured it; otherwise stringify parsed body
    const raw = (req as any).rawBody ?? JSON.stringify(req.body);
    const signature = (req.headers["x-supabase-signature"] as string) ?? undefined;

    // Verify signature
    if (!verifySignature(raw, signature)) {
      return res.status(401).json({ message: "Invalid signature" });
    }

    const payload = req.body;

    // Example: handle Supabase auth events
    // Supabase sends events like { type: "user.deleted", record: { id: 'supabase-id', email: '...'} }
    if (payload?.type === "user.deleted" && payload.record?.id) {
      const supabaseId = String(payload.record.id);

      // Option A: mark user as disabled / clear supabase mapping (typed correctly)
      await prisma.user.updateMany({
        where: { supabaseId },
        data: {
          emailVerified: false,
          provider: null,
          providerId: null,
          // Use `set: null` to assign null to optional fields in Prisma update
          supabaseId: { set: null },
        },
      });

      // Option B (if you prefer to delete): uncomment to delete instead
      // await prisma.user.deleteMany({ where: { supabaseId } });

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
