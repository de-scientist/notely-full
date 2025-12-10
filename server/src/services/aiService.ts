// src/services/aiService.ts
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY ?? "",
});

export const analyzeNote = async (note: string) => {
  const prompt = `
You are an AI assistant inside a note-taking app called Notely.

Your tasks:
1. Improve the writing quality of the note without changing its meaning.
2. Suggest the most accurate category based on the content.
3. Keep the response in this strict JSON format:

{
  "improvedNote": "...",
  "category": "..."
}

Available categories:
["Work", "Personal", "Ideas", "Tasks", "School", "Research", "Journal", "Health", "Finance"]

Note:
"""${note}"""
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.1-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });

  // Safer: protect against undefined objects
  const content =
    response?.choices?.[0]?.message?.content ??
    '{"improvedNote": "' +
      note +
      '", "category": "Uncategorized"}';

  try {
    const json = JSON.parse(content);

    return {
      improvedNote: json.improvedNote ?? note,
      category: json.category ?? "Uncategorized",
    };
  } catch (err) {
    console.error("AI JSON parse error:", err);

    return {
      improvedNote: note,
      category: "Uncategorized",
    };
  }
};
