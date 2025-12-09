import { Express, Request, Response } from "express";

// NOTE: These arrays mimic an in-memory database and should be replaced 
// with actual database calls (e.g., Prisma) in a production environment.
let userMessages: any[] = [];
let adminReplies: any[] = [];

/**
 * Sets up Express routes for the admin message inbox, including
 * message submission, listing, and sending/retrieving replies.
 * * @param app The Express application instance.
 */
export function adminInbox(app: Express) {

    // --- 1. POST /admin/inbox/new (Receive New User Message) ---
    app.post("/admin/inbox/new", async (req: Request, res: Response) => {
        // Assuming express.json() middleware is used for parsing req.body
        const msg = req.body;
        
        // Basic validation
        if (!msg || !msg.message) {
            return res.status(400).json({ error: "Invalid message payload." });
        }
        
        // Add timestamp for completeness
        userMessages.push({ ...msg, timestamp: Date.now() });
        
        return res.json({ ok: true, message: "Message received." });
    });

    // --- 2. GET /admin/inbox/all (List All User Messages) ---
    app.get("/admin/inbox/all", async (_: Request, res: Response) => {
        // Return the full list of messages
        return res.json(userMessages);
    });

    // --- 3. POST /admin/inbox/reply (Send Admin Reply) ---
    app.post("/admin/inbox/reply", async (req: Request, res: Response) => {
        const { userId, replyText } = req.body;

        // Basic validation
        if (!userId || !replyText) {
            return res.status(400).json({ error: "Missing userId or replyText." });
        }

        // Save the reply
        adminReplies.push({ 
            userId, 
            replyText, 
            timestamp: Date.now() 
        });

        return res.json({ ok: true, message: `Reply saved for user ${userId}.` });
    });

    // --- 4. GET /admin/inbox/replies/:userId (Retrieve Replies for a User) ---
    app.get("/admin/inbox/replies/:userId", async (req: Request, res: Response) => {
        // Access route parameters via req.params
        const { userId } = req.params;
        
        // Filter replies based on the userId
        const replies = adminReplies.filter((r) => String(r.userId) === userId);
        
        return res.json(replies);
    });
}