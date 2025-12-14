import { Router, Request, Response } from "express";
import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";
import { cosine } from "../lib/similarity.ts";

// Initialize clients outside the route function
const prisma = new PrismaClient();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Creates and returns an Express Router instance with all RAG (Retrieval-Augmented Generation) routes.
 * * @returns An Express Router instance.
 */
export function ragRoutes() {
  const router = Router();

  // --- POST /api/rag/upload (Embed and Store Document) ---
  router.post("/api/rag/upload", async (req: Request, res: Response) => {
    const { title, content, source } = req.body as {
      title: string;
      content: string;
      source?: string;
    };

    if (!title || !content) {
      return res.status(400).send({ error: "title & content required" });
    }

    try {
      // 1. Compute embedding for the content
      const embResp = await client.embeddings.create({
        model: "text-embedding-3-large",
        input: content,
      });

      // FIX 1 (Error 2532): Safely access embedding data and handle case where data might be missing.
      const embedding = embResp.data[0]?.embedding;

      if (!embedding) {
        return res.status(500).send({ error: "Failed to generate embedding." });
      }

      // 2. Store document and its embedding in the database
      const doc = await prisma.doc.create({
        data: {
          title,
          content,
          embedding: embedding as any,
          // FIX 2 (Error 2375): Explicitly convert 'undefined' to 'null' for Prisma compatibility.
          source: source ?? null,
        },
      });

      return res.send({ ok: true, doc });
    } catch (err) {
      console.error(err);
      return res.status(500).send({ error: "upload failed" });
    }
  });

  // --- POST /api/rag/search (Retrieve Relevant Documents) ---
  router.post("/api/rag/search", async (req: Request, res: Response) => {
    const { query, k = 3 } = req.body as { query: string; k?: number };

    if (!query) {
      return res.status(400).send({ error: "query required" });
    }

    try {
      // 1. Compute embedding for the search query
      const embResp = await client.embeddings.create({
        model: "text-embedding-3-large",
        input: query,
      });

      // FIX 3 (Error 2532): Safely access embedding data and handle case where data might be missing.
      const qVec = embResp.data[0]?.embedding as number[] | undefined;

      if (!qVec) {
        return res
          .status(500)
          .send({ error: "Failed to generate query vector." });
      }

      // 2. Fetch all documents (in a production system, this would be a vector DB query)
      const docs = await prisma.doc.findMany({ where: {}, take: 1000 });

      // 3. Score documents by calculating cosine similarity
      const scored = docs.map((d) => {
        const e = d.embedding as number[] | null;
        if (!e) return { doc: d, score: -1 };
        const score = cosine(qVec, e);
        return { doc: d, score };
      });

      // 4. Sort and select the top K documents
      scored.sort((a, b) => b.score - a.score);
      const top = scored.slice(0, k).map((s) => ({
        score: s.score,
        doc: { id: s.doc.id, title: s.doc.title, content: s.doc.content },
      }));

      return res.send({ top });
    } catch (err) {
      console.error(err);
      return res.status(500).send({ error: "search failed" });
    }
  });

  return router;
}
