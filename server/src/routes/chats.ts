import { Router, Request, Response } from "express";
import dotenv from "dotenv"; // Import dotenv
import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Creates and returns an Express Router instance with all chat and analytics routes.
 * @returns An Express Router instance.
 */
export function chatRoutes() {
  const router = Router();

  dotenv.config(); // Load environment variables (API Key)
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // --- POST /api/chat (Main Chat Logic) ---
  router.post("/api/chat", async (req: Request, res: Response) => {
    const { message, userId, channel, metadata } = req.body as {
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
            // Integrated the more detailed and robust system prompt from the first snippet
            content: `
You are Notely AI Assistant. 
Your job is to guide users on how to use the Notely application.

Keep responses short, clear, and helpful.
Only explain Notely features such as:
- creating notes
- editing notes
- bookmarking notes
- deleting notes
- searching notes
- navigating the UI

If user asks unrelated questions, politely redirect them back to app support.`,
          },
          { role: "user", content: message },
        ],
        max_tokens: 300,
      });

      // Safely access the message content
      const answer =
        completion.choices?.[0]?.message?.content ??
        "AI Assistant failed to generate a reply.";

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

      // Return both the reply and the intent
      return res.send({ reply: answer, intent });
    } catch (err) {
      console.error(err);
      return res.status(500).send({ error: "AI request failed" });
    }
  });

  // --- GET /api/analytics/top-queries (SQL Server FIX) ---
  router.get(
    "/api/analytics/top-queries",
    async (req: Request, res: Response) => {
      try {
        const top = await prisma.$queryRawUnsafe(`
        SELECT TOP 30 [query], COUNT(*) AS [count]
        FROM [ChatLogs]
        GROUP BY [query]
        ORDER BY [count] DESC;
      `);
        return res.send({ top });
      } catch (e) {
        console.error("Error fetching top queries:", e);
        return res
          .status(500)
          .send({ error: "Database error fetching top queries." });
      }
    },
  );

  // --- GET /api/analytics/intents (SQL Server FIX) ---
  router.get("/api/analytics/intents", async (req: Request, res: Response) => {
    try {
      const intents = await prisma.$queryRawUnsafe(`
        SELECT [intent], COUNT(*) AS [count]
        FROM [ChatLogs]
        GROUP BY [intent]
        ORDER BY [count] DESC;
      `);
      return res.send({ intents });
    } catch (e) {
      console.error("Error fetching intents:", e);
      return res
        .status(500)
        .send({ error: "Database error fetching intents." });
    }
  });

  // --- GET /api/analytics/hourly (SQL Server FIX) ---
  router.get("/api/analytics/hourly", async (req: Request, res: Response) => {
    try {
      const hourly = await prisma.$queryRawUnsafe(`
        SELECT 
          DATEADD(hour, DATEDIFF(hour, 0, [createdAt]), 0) as [hour], 
          COUNT(*) as [count]
        FROM [ChatLogs]
        WHERE [createdAt] >= DATEADD(day, -7, GETDATE()) -- Last 7 days
        GROUP BY DATEADD(hour, DATEDIFF(hour, 0, [createdAt]), 0)
        ORDER BY [hour];
      `);
      return res.send({ hourly });
    } catch (e) {
      console.error("Error fetching hourly data:", e);
      return res
        .status(500)
        .send({ error: "Database error fetching hourly data." });
    }
  });

  return router;
}
