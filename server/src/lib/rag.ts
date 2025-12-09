import OpenAI from "openai";
import { db } from "./db";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function embedText(text: string) {
  const result = await client.embeddings.create({
    model: "text-embedding-3-large",
    input: text,
  });

  return result.data[0].embedding;
}

export async function saveDoc(doc) {
  return db.ragDoc.create({
    data: {
      title: doc.title,
      content: doc.content,
      embedding: doc.embedding,
    },
  });
}

export async function listDocs() {
  return db.ragDoc.findMany();
}
