import { Router, Request, Response } from "express";
import OpenAI from "openai";

/**
 * Creates and returns an Express Router instance containing the chat routes.
 * @returns An Express Router with the /api/chat route defined.
 */
export function chatRoutes() {
  // Use Express Router to group routes
  const router = Router();
  
  // Initialize the OpenAI client outside the route handler for performance
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Define the POST route using Express's router.post(path, handler)
  router.post("/api/chat", async (req: Request, res: Response) => {
    // Note: Express requires middleware like `express.json()` to parse req.body
    const { message } = req.body as { message: string };

    if (!message) {
      // Use Express res.status().send() for error responses
      return res.status(400).send({ error: "Message is required" });
    }

    try {
      const completion = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `
You are Notely AI Assistant. 
Your job is to guide users on how to use the Notely application.

Keep responses short, clear, and helpful.
Only explain Notely features such as:
- creating notes
- editing notes
- bookmarking notes
- deleting notes
- searching notes
- navigating the UI

If user asks unrelated questions, politely redirect them back to app support.`,
          },
          { role: "user", content: message },
        ],
      });

      // --- FIX APPLIED HERE ---
      // Safely access the message content using optional chaining (`?`) and the nullish coalescing operator (`??`)
      const answer = completion.choices[0]?.message?.content ?? "AI Assistant failed to generate a reply.";
      // --- END FIX ---
      
      // Use Express res.send() to return the successful response
      return res.send({ reply: answer });
    } catch (err) {
      console.error(err);
      // Use Express res.status().send() for server errors
      return res.status(500).send({ error: "AI request failed" });
    }
  });
  
  return router;
}