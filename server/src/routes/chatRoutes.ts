import { Router, Request, Response } from "express";
import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";
import { analyticsEmitter } from "../lib/analyticsEmitter.ts";
import { cosine } from "../lib/similarity.ts";

// Initialize clients outside the route function
const prisma = new PrismaClient();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Creates and returns an Express Router instance with the RAG chat route.
 * @returns An Express Router instance.
 */
export function chatRoutes() { // Changed signature to return Router
  const router = Router();

  // --- POST /api/chat (Main RAG Chat Logic) ---
  router.post("/api/chat", async (req: Request, res: Response) => { // Using Express Request/Response
    const { message, userId, channel, metadata } =
      req.body as { message: string; userId?: string; channel?: string; metadata?: any };

    if (!message) return res.status(400).send({ error: "Message required" }); // Using res.status.send

    try {
      // 1) RAG retrieval: compute embedding of message
      const embResp = await client.embeddings.create({
        model: "text-embedding-3-large",
        input: message,
      });
      // Ensure safe access to embedding data
      const qVec = embResp.data[0]?.embedding as number[] | undefined; 
      
      if (!qVec) {
          return res.status(500).send({ error: "Failed to generate query vector." });
      }

      // 2) fetch candidate docs (small-scale)
      const docs = await prisma.doc.findMany({ where: {}, take: 200 }); 
      
      const scored = docs
        .map((d) => {
          const e = d.embedding as number[] | null;
          // Safely handle null/undefined embeddings
          if (!e) return null; 
          const score = cosine(qVec, e);
          return { doc: d, score };
        })
        .filter((item): item is { doc: typeof docs[0]; score: number } => Boolean(item)) // TypeScript refinement
        .sort((a, b) => b.score - a.score)
        .slice(0, 4); // top 4

      // 3) build retrieval text
      const retrievedText = scored
        .map((s, idx) => `DOC ${idx + 1} - ${s.doc.title}\n${s.doc.content}\n---`)
        .join("\n");

      // 4) craft system prompt with retrieved docs
      const systemPrompt = `
You are Notely AI Assistant with access to Notely help docs. Use only the retrieved docs below to answer app-specific questions when helpful. Keep replies short (< 80 words), actionable, and show examples where needed. If the user asks unrelated questions, respond with: "I can only help with Notely features. For other questions, contact support.".
RETRIEVED_DOCS:
${retrievedText || "NO_DOCS_FOUND"}
`;

      // 5) call LLM with system + user
      const completion = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: 350,
      });

      const answer = completion.choices?.[0]?.message?.content ?? "Sorry, I couldn't answer that.";

      // lightweight intent
      const lower = message.toLowerCase();
      let intent = "unknown";
      if (/(create|new note|add note)/.test(lower)) intent = "create";
      else if (/(edit|update|modify)/.test(lower)) intent = "edit";
      else if (/(delete|remove|trash)/.test(lower)) intent = "delete";
      else if (/(bookmark|star|save)/.test(lower)) intent = "bookmark";
      else if (/(search|find|lookup)/.test(lower)) intent = "search";
      else if (/(navigate|home|open)/.test(lower)) intent = "navigation";

      // 6) Log to DB
      const chat = await prisma.chatLog.create({
        data: {
          // Use nullish coalescing to ensure Prisma compatibility for optional fields
          userId: userId ?? null, 
          query: message,
          reply: answer,
          intent,
          channel: channel ?? "web",
          metadata: metadata ? JSON.stringify(metadata) : null, // Store metadata as JSON string or null
        },
      });

      // 7) Emit event for realtime dashboard
      analyticsEmitter.emit("new_chat", {
        id: chat.id,
        userId: chat.userId,
        query: chat.query,
        reply: chat.reply,
        intent: chat.intent,
        channel: chat.channel,
        createdAt: chat.createdAt,
      });

      return res.send({ reply: answer, intent }); // Using res.send
    } catch (err) {
      console.error(err); // Using console.error instead of app.log.error
      return res.status(500).send({ error: "AI request failed" }); // Using res.status.send
    }
  });
  
  return router;
}