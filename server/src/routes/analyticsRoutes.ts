import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { analyticsEmitter } from "../lib/analyticsEmitter.ts";// Assuming this path is correct
import { pipeline } from "stream"; // Use Node's pipeline utility
import { promisify } from "util";
import csvStringify from "csv-stringify"; // Changed to named import for clarity

// Promisify the stream pipeline for use with async/await
const pipelinePromise = promisify(pipeline);

const prisma = new PrismaClient();

/**
 * Creates and returns an Express Router instance with all analytics routes.
 * @returns An Express Router instance.
 */
export function analyticsRoutes() { // Changed signature to return Router
    const router = Router();

    // --- GET /api/analytics/query (Filtered Chat Log Data) ---
    router.get("/api/analytics/query", async (req: Request, res: Response) => {
        // Query parameters are accessed via req.query
        const { start, end, intent, channel, search, limit = "50", offset = "0" } = req.query as {
            start?: string;
            end?: string;
            intent?: string;
            channel?: string;
            search?: string;
            limit?: string;
            offset?: string;
        };

        const where: any = {};
        if (intent) where.intent = intent;
        if (channel) where.channel = channel;
        
        if (start || end) where.createdAt = {};
        if (start) where.createdAt.gte = new Date(start);
        if (end) where.createdAt.lte = new Date(end);
        
        // Use Prisma's mode: "insensitive" (PostgreSQL specific, common for ORMs)
        if (search) where.OR = [{ query: { contains: search, mode: "insensitive" } }, { reply: { contains: search, mode: "insensitive" } }];

        try {
            const results = await prisma.chatLog.findMany({
                where,
                orderBy: { createdAt: "desc" },
                take: Number(limit),
                skip: Number(offset),
            });

            const total = await prisma.chatLog.count({ where });

            return res.send({ total, results }); // Using res.send
        } catch (error) {
            console.error("Analytics query error:", error);
            return res.status(500).send({ error: "Failed to fetch analytics data." });
        }
    });

    // --- GET /api/analytics/export (CSV Export) ---
    router.get("/api/analytics/export", async (req: Request, res: Response) => {
        const { start, end, intent, channel, search } = req.query as any;
        const where: any = {};
        if (intent) where.intent = intent;
        if (channel) where.channel = channel;
        if (start || end) where.createdAt = {};
        if (start) where.createdAt.gte = new Date(start);
        if (end) where.createdAt.lte = new Date(end);
        if (search) where.OR = [{ query: { contains: search, mode: "insensitive" } }, { reply: { contains: search, mode: "insensitive" } }];

        try {
            const results = await prisma.chatLog.findMany({ where, orderBy: { createdAt: "desc" } });

            // Set headers for CSV download in Express
            res.setHeader("Content-Type", "text/csv");
            res.setHeader("Content-Disposition", `attachment; filename="notely_chats_${Date.now()}.csv"`);
            
            // Create the CSV stringifier stream
            const csvStream = csvStringify.stringify({
                header: true,
                columns: ["id", "userId", "query", "reply", "intent", "channel", "createdAt"],
            });

            // Pipe the CSV stream directly into the Express response stream
            // NOTE: Using a promise-based pipeline ensures proper error handling and stream closing
            const dataStream = new (require('stream').Readable)({ objectMode: true });
            
            results.forEach((r) => {
                dataStream.push([r.id, r.userId ?? "", r.query, r.reply, r.intent ?? "", r.channel, r.createdAt.toISOString()]);
            });
            dataStream.push(null); // End the readable stream

            // Use the promisified pipeline to connect the readable data stream, CSV transformer, and response stream
            await pipelinePromise(
                dataStream,
                csvStream,
                res
            );

            // Express automatically handles closing the connection when the stream pipes to 'res' finish.
        } catch (error) {
            console.error("CSV export error:", error);
            // Check if headers were sent before attempting to send a 500 status
            if (!res.headersSent) {
                res.status(500).send("CSV export failed.");
            }
        }
    });

    // --- GET /api/analytics/top-queries (SQL Server FIX retained from earlier context) ---
    router.get("/api/analytics/top-queries", async (req: Request, res: Response) => {
        try {
            // NOTE: The previous context suggested SQL Server, which uses [ChatLogs].
            // The original code used PostgreSQL syntax (double quotes) and table name ("ChatLog").
            // I'm assuming PostgreSQL for this specific query syntax but using generic Prisma $queryRawUnsafe.
            const top = await prisma.$queryRawUnsafe(`
                SELECT query, COUNT(*) AS count
                FROM "ChatLog"
                GROUP BY query
                ORDER BY count DESC
                LIMIT 30;
            `);
            return res.send({ top });
        } catch (error) {
            console.error("Top queries error:", error);
            return res.status(500).send({ error: "Failed to fetch top queries." });
        }
    });

    // --- GET /api/analytics/intents (SQL Server FIX retained from earlier context) ---
    router.get("/api/analytics/intents", async (req: Request, res: Response) => {
        try {
            const intents = await prisma.$queryRawUnsafe(`
                SELECT COALESCE(intent,'unknown') as intent, COUNT(*) AS count
                FROM "ChatLog"
                GROUP BY intent
                ORDER BY count DESC;
            `);
            return res.send({ intents });
        } catch (error) {
            console.error("Intents error:", error);
            return res.status(500).send({ error: "Failed to fetch intents data." });
        }
    });

    // --- GET /api/analytics/hourly (SQL Server FIX retained from earlier context) ---
    router.get("/api/analytics/hourly", async (req: Request, res: Response) => {
        try {
            const hourly = await prisma.$queryRawUnsafe(`
                SELECT date_trunc('hour', "createdAt") as hour, COUNT(*) as count
                FROM "ChatLog"
                WHERE "createdAt" > now() - interval '7 days'
                GROUP BY hour
                ORDER BY hour;
            `);
            return res.send({ hourly });
        } catch (error) {
            console.error("Hourly data error:", error);
            return res.status(500).send({ error: "Failed to fetch hourly data." });
        }
    });

    // --- GET /api/analytics/stream (Server-Sent Events) ---
    router.get("/api/analytics/stream", (req: Request, res: Response) => {
        // 1. Set headers for SSE in Express
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.write(`retry: 2000\n\n`); // Send initial retry instruction

        // 2. Listener function to send data
        const onNew = (data: any) => {
            try {
                // Check if response stream is still open before writing
                if (res.writableEnded) {
                    analyticsEmitter.off("new_chat", onNew);
                    return;
                }
                res.write(`event: new_chat\n`);
                res.write(`data: ${JSON.stringify(data)}\n\n`);
            } catch (e) {
                // If writing fails, clean up the listener
                console.error("SSE write error:", e);
                analyticsEmitter.off("new_chat", onNew);
            }
        };

        // 3. Attach listener
        analyticsEmitter.on("new_chat", onNew);

        // 4. Cleanup when client disconnects
        req.on("close", () => {
            analyticsEmitter.off("new_chat", onNew);
            // Ensure the response stream is closed explicitly if not already
            if (!res.writableEnded) {
                res.end();
            }
        });
    });
    
    return router;
}