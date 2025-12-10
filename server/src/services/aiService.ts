// src/services/aiService.ts
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
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

  const chat = await groq.chat.completions.create({
    model: "llama-3.1-70b-versatile", // you can switch to Mixtral if cheaper
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.2,
  });

  const raw = chat.choices[0].message?.content;

  try {
    const json = JSON.parse(raw || "{}");
    return {
      improvedNote: json.improvedNote || note,
      category: json.category || "Uncategorized",
    };
  } catch (err) {
    console.log("AI JSON parse error:", err);
    return {
      improvedNote: note,
      category: "Uncategorized",
    };
  }
};
