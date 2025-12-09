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

      // --- Database Logging ---
      const dbUserId = userId ?? null;
      const dbChannel = channel ?? "web";
      const dbMetadata = metadata ? JSON.stringify(metadata) : null;

      await prisma.chatLog.create({
        data: {
          userId: dbUserId,
          query: message,
          reply: answer,
          intent,
          channel: dbChannel,
          metadata: dbMetadata,
        },
      });
      // --- END Database Logging ---

      return res.send({ reply: answer, intent });
    } catch (err) {
      console.error(err);
      return res.status(500).send({ error: "AI request failed" });
    }
  });

  // --- GET /api/analytics/top-queries ---
  router.get("/api/analytics/top-queries", async (req: Request, res: Response) => {
    try {
      // Adjusted quoting for SQL Server: using [ChatLog]
      const top = await prisma.$queryRawUnsafe(`
        SELECT query, COUNT(*) AS count
        FROM [ChatLog]
        GROUP BY query
        ORDER BY count DESC
        OFFSET 0 ROWS FETCH NEXT 30 ROWS ONLY; 
        -- SQL Server uses OFFSET/FETCH for LIMIT
      `);
      return res.send({ top });
    } catch (e) {
      console.error("Error fetching top queries:", e);
      return res.status(500).send({ error: "Database error fetching top queries." });
    }
  });

  // --- GET /api/analytics/intents ---
  router.get("/api/analytics/intents", async (req: Request, res: Response) => {
    try {
      // Adjusted quoting for SQL Server: using [ChatLog]
      const intents = await prisma.$queryRawUnsafe(`
        SELECT intent, COUNT(*) AS count
        FROM [ChatLog]
        GROUP BY intent
        ORDER BY count DESC;
      `);
      return res.send({ intents });
    } catch (e) {
      console.error("Error fetching intents:", e);
      return res.status(500).send({ error: "Database error fetching intents." });
    }
  });

  // --- GET /api/analytics/hourly (SQL SERVER FIX) ---
  router.get("/api/analytics/hourly", async (req: Request, res: Response) => {
    // FIX: Using SQL Server functions (DATEADD, DATEDIFF, GETDATE) for date arithmetic and grouping.
    try {
      const hourly = await prisma.$queryRawUnsafe(`
        SELECT 
          DATEADD(hour, DATEDIFF(hour, 0, [createdAt]), 0) as hour, 
          COUNT(*) as count
        FROM [ChatLog]
        WHERE [createdAt] >= DATEADD(day, -7, GETDATE()) -- Last 7 days
        GROUP BY DATEADD(hour, DATEDIFF(hour, 0, [createdAt]), 0)
        ORDER BY hour;
      `);
      return res.send({ hourly });
    } catch (e) {
      console.error("Error fetching hourly data (SQL Server syntax error detected):", e);
      return res.status(500).send({ error: "Database error fetching hourly data. SQL Server syntax may need verification." });
    }
  });

  return router;
}