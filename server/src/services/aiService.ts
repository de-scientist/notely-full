import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY ?? "",
});

// Define the interface for the input data
interface NoteData {
    title: string;
    synopsis: string;
    content: string;
    categoryId?: string; // Optional, might be used for context later
}

// Define the interface for the expected JSON output
interface AiServiceResponse {
    improvedTitle: string;
    improvedSynopsis: string;
    improvedContent: string;
    suggestedCategoryName: string; // Changed from 'category' to 'suggestedCategoryName'
}

// Update the function signature to accept the structured object
export const analyzeNote = async (data: NoteData) => {
  // Construct the prompt with all available data fields
  const prompt = `
You are an AI assistant inside a note-taking app called Notely. Your goal is to refine the user's draft note and suggest the best category.

Your tasks:
1. Improve the **Title** for clarity and impact.
2. Improve the **Synopsis** to be concise and descriptive.
3. Improve the **Content** (body of the note) for writing quality, grammar, and flow, without changing its core facts or meaning.
4. Suggest the single most accurate category name from the list provided.
5. Keep the response in this strict JSON format:

{
  "improvedTitle": "...",
  "improvedSynopsis": "...",
  "improvedContent": "...",
  "suggestedCategoryName": "..."
}

Available categories:
["Work", "Personal", "Ideas", "Tasks", "School", "Research", "Journal", "Health", "Finance", "Uncategorized"]

User Draft:
---
Title: "${data.title}"
Synopsis: "${data.synopsis}"
Content:
"""${data.content}"""
---
`;

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      response_format: { type: "json_object" }, // Enforce JSON output
    });

    const content = response?.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error("AI returned no content.");
    }
    
    // Parse the structured JSON response
    const json: Partial<AiServiceResponse> = JSON.parse(content);
    
    // Return structured data, falling back to original if any field is missing
    return {
      improvedTitle: json.improvedTitle ?? data.title,
      improvedSynopsis: json.improvedSynopsis ?? data.synopsis,
      improvedContent: json.improvedContent ?? data.content,
      suggestedCategoryName: json.suggestedCategoryName ?? "Uncategorized",
    };

  } catch (err) {
    console.error("AI processing error:", err);

    // Return the original data and a generic error category on failure
    return {
      improvedTitle: data.title,
      improvedSynopsis: data.synopsis,
      improvedContent: data.content,
      suggestedCategoryName: "Uncategorized",
    };
  }
};