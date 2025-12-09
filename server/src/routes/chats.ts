import { Router, Request, Response } from "express";
import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Creates and returns an Express Router instance with all chat and analytics routes.
 * @returns An Express Router instance.
 */
export function chatRoutes() {
  const router = Router();
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // --- POST /api/chat (Main Chat Logic) ---
  router.post("/api/chat", async (req: Request, res: Response) => {
    const { message, userId, channel, metadata } =
      req.body as {
        message: string;
        userId?: string;
        channel?: string;
        metadata?: any;
      };

    if (!message) return res.status(400).send({ error: "Message required" });

    try {
      const completion = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `You are Notely AI Assistant. Keep replies short, actionable, and specific to the Notely app features (create, edit, delete, bookmark, search, navigate). If user asks unrelated questions, redirect to app support.`,
          },
          { role: "user", content: message },
        ],
        max_tokens: 300,
      });

      const answer = completion.choices?.[0]?.message?.content ?? "Sorry, I couldn't answer that.";

      // Optional: lightweight intent guessing using keywords (fast)
      const lower = message.toLowerCase();
      let intent = "unknown";
      if (/(create|new note|add note)/.test(lower)) intent = "create";
      else if (/(edit|update|modify)/.test(lower)) intent = "edit";
      else if (/(delete|remove|trash)/.test(lower)) intent = "delete";
      else if (/(bookmark|star|save)/.test(lower)) intent = "bookmark";
      else if (/(search|find|lookup)/.test(lower)) intent = "search";
      else if (/(navigate|home|open)/.test(lower)) intent = "navigation";

      // --- FIX APPLIED HERE ---
      // Convert `userId`, `channel`, and `metadata` from `undefined` to `null` 
      // if they are missing, as required by Prisma's generated types for optional fields.
      const dbUserId = userId ?? null;
      const dbChannel = channel ?? "web"; // Channel has a default but setting it to 'web' is fine
      // If your 'metadata' field in Prisma is defined as String? (for SQL Server), 
      // you must stringify the object/data before saving it.
      // If your 'metadata' field is defined as Json? (for Postgres), you can pass the object or null.
      const dbMetadata = metadata ? JSON.stringify(metadata) : null; 
      // Assuming String? type for metadata based on previous error context:

      // Log to DB
      await prisma.chatLog.create({
        data: {
          userId: dbUserId,       // Now string | null
          query: message,
          reply: answer,
          intent,
          channel: dbChannel,
          metadata: dbMetadata,   // Now string | null (assuming String? schema)
        },
      });
      // --- END FIX ---

      return res.send({ reply: answer, intent });
    } catch (err) {
      console.error(err);
      return res.status(500).send({ error: "AI request failed" });
    }
  });

  // Analytics routes remain unchanged (omitted for brevity, but they would follow here)
  router.get("/api/analytics/top-queries", async (req: Request, res: Response) => {
    const top = await prisma.$queryRawUnsafe(`
      SELECT query, COUNT(*) AS count
      FROM "ChatLog"
      GROUP BY query
      ORDER BY count DESC
      LIMIT 30;
    `);
    return res.send({ top });
  });

  router.get("/api/analytics/intents", async (req: Request, res: Response) => {
    const intents = await prisma.$queryRawUnsafe(`
      SELECT intent, COUNT(*) AS count
      FROM "ChatLog"
      GROUP BY intent
      ORDER BY count DESC;
    `);
    return res.send({ intents });
  });

  router.get("/api/analytics/hourly", async (req: Request, res: Response) => {
    const hourly = await prisma.$queryRawUnsafe(`
      SELECT date_trunc('hour', "createdAt") as hour, COUNT(*) as count
      FROM "ChatLog"
      WHERE "createdAt" > now() - interval '7 days'
      GROUP BY hour
      ORDER BY hour;
    `);
    return res.send({ hourly });
  });

  return router;
}