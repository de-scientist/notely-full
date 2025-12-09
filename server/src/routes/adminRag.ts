import { Express, Request, Response } from "express";
import { addDocsToStore } from "./vectorStore.ts";

/**
 * Sets up an Express route for uploading RAG knowledge base content.
 * * @param app The Express application instance.
 */
export function adminRag(app: Express) {
    
    // Express POST route handler
    app.post("/admin/rag/upload", async (req: Request, res: Response) => {
        // Express uses req.body directly (assuming body-parser or express.json() middleware is used)
        const { text } = req.body;

        // Input validation and error response using Express syntax
        if (!text) {
            return res.status(400).json({ error: "Missing text in request body." });
        }

        try {
            // Call the vector store function
            await addDocsToStore(text);
            
            // Success response using Express syntax
            return res.json({ ok: true, message: "Knowledge uploaded and indexed successfully." });
        } catch (error) {
            console.error("RAG Upload Error:", error);
            // Internal Server Error response
            return res.status(500).json({ error: "Failed to process and index the knowledge content." });
        }
    });
}