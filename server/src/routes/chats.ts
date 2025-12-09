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
    // Fastify's req.body type is explicit, here we cast it for Express
    const { message, userId, channel, metadata } =
      req.body as {
        message: string;
        userId?: string;
        channel?: string;
        metadata?: any;
      };

    // Use Express res.status().send() for error responses
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

      // Log to DB
      await prisma.chatLog.create({
        data: {
          userId,
          query: message,
          reply: answer,
          intent,
          channel: channel ?? "web",
          // The metadata field type depends on your DB connector. 
          // If using SQL Server, it must be saved as a string (JSON.stringify(metadata)).
          // If using PostgreSQL (which supports JSON), 'metadata' can be passed directly.
          // Assuming PostgreSQL for type compatibility with the original Fastify code:
          metadata: metadata ?? {},
        },
      });

      // Use Express res.send() to return the response
      return res.send({ reply: answer, intent });
    } catch (err) {
      console.error(err); // Express doesn't have app.log.error, use console.error
      return res.status(500).send({ error: "AI request failed" });
    }
  });

  // --- GET /api/analytics/top-queries ---
  router.get("/api/analytics/top-queries", async (req: Request, res: Response) => {
    // NOTE: This SQL syntax is specific to PostgreSQL
    const top = await prisma.$queryRawUnsafe(`
      SELECT query, COUNT(*) AS count
      FROM "ChatLog"
      GROUP BY query
      ORDER BY count DESC
      LIMIT 30;
    `);
    return res.send({ top });
  });

  // --- GET /api/analytics/intents ---
  router.get("/api/analytics/intents", async (req: Request, res: Response) => {
    const intents = await prisma.$queryRawUnsafe(`
      SELECT intent, COUNT(*) AS count
      FROM "ChatLog"
      GROUP BY intent
      ORDER BY count DESC;
    `);
    return res.send({ intents });
  });

  // --- GET /api/analytics/hourly ---
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