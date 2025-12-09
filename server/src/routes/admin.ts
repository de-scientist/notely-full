import { Router, Request, Response } from "express";
import OpenAI from "openai";
import { saveDoc, listDocs, embedText, queryDocs } from "../lib/rag";
import { db } from "../lib/db"; // Assuming `db` is your Prisma/database client
import { randomUUID } from "crypto";
// IMPORTANT: Assuming you have a global EventEmitter for handling server-side events (SSE)
import { analyticsEmitter } from "../lib/analyticsEmitter.ts";

// Initialize OpenAI client globally
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Creates and returns an Express Router instance with all administration and RAG routes.
 * @returns An Express Router instance.
 */
export function adminRoutes() { 
  const router = Router();

  // --- RAG UPLOAD DOCS (POST /admin/rag/upload) ---
  router.post("/admin/rag/upload", async (req: Request, res: Response) => {
    const { text, title } = req.body as { text: string; title: string };

    if (!text || !title) {
        return res.status(400).send({ success: false, error: "Text and title required" });
    }

    try {
        // Use the imported helper functions
        const embedding = await embedText(text); 
        await saveDoc({ title, content: text, embedding });
    
        return res.send({ success: true });
    } catch (error) {
        console.error("RAG upload failed:", error);
        return res.status(500).send({ success: false, error: "RAG upload failed" });
    }
  });

  // --- LIST RAG DOCS (GET /admin/rag/docs) ---
  router.get("/admin/rag/docs", async (req: Request, res: Response) => {
    try {
        const docs = await listDocs();
        return res.send(docs);
    } catch (error) {
        console.error("List docs failed:", error);
        return res.status(500).send({ error: "Failed to list documents" });
    }
  });

  // --- STREAM USER QUERIES (GET /admin/queries/stream - SSE) ---
  router.get("/admin/queries/stream", (req: Request, res: Response) => {
    // Set headers for Server-Sent Events (SSE)
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    });
    res.write(`retry: 2000\n\n`);

    // Use the global analyticsEmitter instead of Fastify's custom hook
    const onUserQuery = (msg: any) => {
      try {
        // Ensure the response is still writable
        if (!res.writableEnded) { 
            res.write(`event: user_query\n`); // Optional event type
            res.write(`data: ${JSON.stringify(msg)}\n\n`);
        }
      } catch (e) {
          console.error("SSE write error:", e);
          analyticsEmitter.off("onUserQuery", onUserQuery);
      }
    };

    analyticsEmitter.on("onUserQuery", onUserQuery);

    // Clean up when client disconnects
    req.on("close", () => {
      analyticsEmitter.off("onUserQuery", onUserQuery);
      if (!res.writableEnded) {
          res.end();
      }
    });
  });

  // --- RECORD A USER QUERY (POST /record-user-query) ---
  router.post("/record-user-query", async (req: Request, res: Response) => {
    // Assuming userId and question are passed in the request body
    const { userId, question } = req.body as { userId: string; question: string };

    if (!userId || !question) {
        return res.status(400).send({ ok: false, error: "userId and question required" });
    }

    try {
        // Log to database (using the db client)
        await db.query.create({
            data: {
                id: randomUUID(),
                userId,
                question,
                createdAt: new Date(),
            },
        });
    
        // Emit event for the SSE stream endpoint
        analyticsEmitter.emit("onUserQuery", { userId, question, createdAt: new Date().toISOString() });
    
        return res.send({ ok: true });
    } catch (error) {
        console.error("Record query failed:", error);
        return res.status(500).send({ ok: false, error: "Failed to record query" });
    }
  });

  // --- LIST QUERIES (GET /admin/queries) ---
  router.get("/admin/queries", async (req: Request, res: Response) => {
    try {
        const queries = await db.query.findMany({
            orderBy: { createdAt: "desc" },
        });
        return res.send(queries);
    } catch (error) {
        console.error("List queries failed:", error);
        return res.status(500).send({ error: "Failed to list queries" });
    }
  });

  // --- LIST USER MESSAGES (GET /admin/messages) ---
  router.get("/admin/messages", async (req: Request, res: Response) => {
    try {
        const messages = await db.userMessage.findMany({ orderBy: { createdAt: "desc" } });
        return res.send(messages);
    } catch (error) {
        console.error("List messages failed:", error);
        return res.status(500).send({ error: "Failed to list messages" });
    }
  });

  // --- RESPOND TO USER (POST /admin/messages/respond) ---
  router.post("/admin/messages/respond", async (req: Request, res: Response) => {
    const { messageId, reply } = req.body as { messageId: string; reply: string };

    if (!messageId || !reply) {
        return res.status(400).send({ ok: false, error: "messageId and reply required" });
    }

    try {
        await db.userMessage.update({
            where: { id: messageId },
            data: { adminReply: reply },
        });
    
        return res.send({ ok: true });
    } catch (error) {
        console.error("Respond failed:", error);
        return res.status(500).send({ ok: false, error: "Failed to send response" });
    }
  });
  
  return router;
}