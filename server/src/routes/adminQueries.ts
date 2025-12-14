import { Express, Request, Response } from "express";

// A global array to hold all active HTTP response objects (listeners)
let listeners: Response[] = [];

/**
 * Sets up two Express routes for managing and streaming user queries:
 * 1. GET /admin/queries/stream: Opens an SSE connection to broadcast new queries.
 * * 2. POST /admin/queries/new: Receives a new query and broadcasts it to all active listeners.
 * * @param app The Express application instance.
 */
export function adminQueries(app: Express) {
  // --- 1. SSE Stream Endpoint ---
  app.get("/admin/queries/stream", (req: Request, res: Response) => {
    // 1. Set headers for Server-Sent Events (SSE)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // This is necessary to prevent Nginx/other reverse proxies from buffering
    res.flushHeaders();

    // 2. Add the current response object to the listeners array
    listeners.push(res);
    console.log(
      `New SSE client connected. Total listeners: ${listeners.length}`,
    );

    // 3. Handle client disconnection (crucial for memory management)
    req.on("close", () => {
      listeners = listeners.filter((r) => r !== res);
      console.log(
        `SSE client disconnected. Total listeners: ${listeners.length}`,
      );
    });

    // Optionally, send an initial message to confirm connection
    // res.write(`data: ${JSON.stringify({ message: "Connected to query stream" })}\n\n`);
  });

  // --- 2. New Message Endpoint ---
  app.post("/admin/queries/new", (req: Request, res: Response) => {
    // Express uses req.body directly for POST data (assuming body-parser middleware is used)
    const { text, userId, timestamp } = req.body;

    const newQuery = {
      text,
      userId,
      timestamp,
      createdAt: new Date().toISOString(),
    };

    // 1. Broadcast the new query to all active listeners
    listeners.forEach((listener) => {
      // SSE format: data: [JSON payload]\n\n
      try {
        listener.write(`data: ${JSON.stringify(newQuery)}\n\n`);
      } catch (error) {
        // Log or handle errors if a connection has gone stale but wasn't removed yet
        console.error("Error writing to listener:", error);
      }
    });

    // 2. Respond to the client that posted the new query
    return res.json({ ok: true, message: "Query broadcasted" });
  });
}
