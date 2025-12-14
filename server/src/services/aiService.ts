import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY ?? "",
});

// Input format from user
interface NoteData {
  title?: string;
  synopsis?: string;
  content: string;
  categoryId?: string;
}

// Output format from AI
interface AiServiceResponse {
  generatedTitle: string;
  generatedSynopsis: string;
  generatedContent: string;
  suggestedCategoryName: string;
}

export const analyzeNote = async (data: NoteData) => {
  const prompt = `
You are the AI writer inside a note-taking app called Notely.

Your job is NOT to improve the note — your job is to **write the full professional note** from the user's request or draft.

### Your tasks:
1. If the user’s title is empty or weak, create a stronger one.
2. If the user’s synopsis is missing, generate a clear one-sentence summary.
3. Rewrite or fully generate the content using clean, professional writing.
4. Select the best category name.
5. Output ONLY this strict JSON:

{
  "generatedTitle": "...",
  "generatedSynopsis": "...",
  "generatedContent": "...",
  "suggestedCategoryName": "..."
}

### Available categories:
["Work", "Personal", "Ideas", "Tasks", "School", "Research", "Journal", "Health", "Finance", "Uncategorized"]

### User Input:
Title: "${data.title ?? ""}"
Synopsis: "${data.synopsis ?? ""}"
Content:
"""${data.content}"""
`;

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const content = response?.choices?.[0]?.message?.content;

    if (!content) throw new Error("AI returned empty response");

    const json = JSON.parse(content) as Partial<AiServiceResponse>;

    return {
      generatedTitle: json.generatedTitle ?? data.title ?? "Untitled Note",
      generatedSynopsis:
        json.generatedSynopsis ?? data.synopsis ?? "No synopsis provided",
      generatedContent: json.generatedContent ?? data.content,
      suggestedCategoryName: json.suggestedCategoryName ?? "Uncategorized",
    };
  } catch (err) {
    console.error("AI processing error:", err);

    return {
      generatedTitle: data.title ?? "Untitled Note",
      generatedSynopsis: data.synopsis ?? "No synopsis provided",
      generatedContent: data.content,
      suggestedCategoryName: "Uncategorized",
    };
  }
};
