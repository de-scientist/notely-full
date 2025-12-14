// server/src/services/aiService.ts
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type GenerateNoteOptions = {
  title?: string;
  synopsis?: string;
  audience?: string; // optional: "student", "developer", "general"
  tone?: string; // optional: e.g., "concise", "lyrical", "technical"
  length?: "short" | "medium" | "long";
};

export async function generateFullNote(
  opts: GenerateNoteOptions,
): Promise<string> {
  const {
    title = "",
    synopsis = "",
    audience = "general",
    tone = "helpful",
    length = "medium",
  } = opts; // map length to max tokens roughly

  const maxTokens = length === "short" ? 400 : length === "medium" ? 800 : 1400; // System message defines behavior: write a full ready-to-save note

  const systemMessage = `You are an expert note-writer. Produce a finished note suitable for saving in a note-taking app.
- Output must be valid Markdown.
- Include a H1 title, a short synopsis blockquote, and then well-structured sections with headings, bullet lists, and examples where appropriate.
- Keep the note focused on the provided title and synopsis. Do NOT output meta commentary like "here is the note".`;

  const userPrompt = `Title: ${title}
Synopsis: ${synopsis}
Audience: ${audience}
Tone: ${tone}
Requirements:
- Write the full note in Markdown.
- Start with "# <Title>".
- Include a one-line synopsis under the title in a blockquote.
- Provide at least 3 sections, with clear headings and useful content.
- If applicable, provide a "Key takeaways" section at the end.
`;

  const response = await client.chat.completions.create({
    // FIX: Using a standard, available OpenAI model name (e.g., gpt-4o-mini)
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: userPrompt },
    ],
    max_tokens: maxTokens,
    temperature: 0.2,
  }); // Chat completions returns choices; get the text content

  const output = response.choices?.[0]?.message?.content ?? "";
  return output;
}
