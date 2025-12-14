import OpenAI from "openai";
// FIX 1: Added explicit file extension for relative import (required by node16 module resolution)
import { db } from "./db.ts";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Define a type for the data structure being saved to avoid implicit 'any' (Error 7006)
type RagDocumentPayload = {
  title: string;
  content: string; // Assuming 'content' field exists in the database/payload
  embedding: number[]; // Assuming the embedding is an array of numbers
};

export async function embedText(text: string): Promise<number[]> {
  const result = await client.embeddings.create({
    model: "text-embedding-3-large",
    input: text,
  });

  // FIX 2: Added a safety check for result.data[0] to satisfy TypeScript's strict check (Error 2532)
  if (!result.data || result.data.length === 0) {
    throw new Error("Embedding API returned no data.");
  }

  return result.data[0].embedding;
}

// FIX 3: Explicitly typed the 'doc' parameter using RagDocumentPayload (Error 7006)
export async function saveDoc(doc: RagDocumentPayload) {
  return db.Doc.create({
    data: {
      title: doc.title,
      // Assuming the field is 'content' based on the database access pattern
      content: doc.content,
      embedding: doc.embedding,
    },
  });
}

export async function listDocs() {
  return db.ragDoc.findMany();
}
