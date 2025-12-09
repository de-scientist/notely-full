import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { analyticsEmitter } from "../lib/analyticsEmitter.ts";
import { pipeline } from "stream"; 
import { promisify } from "util";
// FIX: Changed default import to named import 'stringify' 
import { stringify } from "csv-stringify"; 

// Promisify the stream pipeline for use with async/await
const pipelinePromise = promisify(pipeline);

const prisma = new PrismaClient();

/**
 * Creates and returns an Express Router instance with all analytics routes.
 * @returns An Express Router instance.
 */
export function analyticsRoutes() { 
    const router = Router();

    // --- GET /api/analytics/query (Filtered Chat Log Data) ---
    router.get("/api/analytics/query", async (req: Request, res: Response) => {
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
        
        if (search) where.OR = [{ query: { contains: search, mode: "insensitive" } }, { reply: { contains: search, mode: "insensitive" } }];

        try {
            const results = await prisma.chatLog.findMany({
                where,
                orderBy: { createdAt: "desc" },
                take: Number(limit),
                skip: Number(offset),
            });

            const total = await prisma.chatLog.count({ where });

            return res.send({ total, results }); 
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

            res.setHeader("Content-Type", "text/csv");
            res.setHeader("Content-Disposition", `attachment; filename="notely_chats_${Date.now()}.csv"`);
            
            // FIX: Use the imported 'stringify' function
            const csvStream = stringify({
                header: true,
                columns: ["id", "userId", "query", "reply", "intent", "channel", "createdAt"],
            });

            const dataStream = new (require('stream').Readable)({ objectMode: true });
            
            results.forEach((r) => {
                dataStream.push([r.id, r.userId ?? "", r.query, r.reply, r.intent ?? "", r.channel, r.createdAt.toISOString()]);
            });
            dataStream.push(null); 

            await pipelinePromise(
                dataStream,
                csvStream,
                res
            );

        } catch (error) {
            console.error("CSV export error:", error);
            if (!res.headersSent) {
                res.status(500).send("CSV export failed.");
            }
        }
    });

    // --- GET /api/analytics/top-queries ---
    router.get("/api/analytics/top-queries", async (req: Request, res: Response) => {
        try {
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

    // --- GET /api/analytics/intents ---
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

    // --- GET /api/analytics/hourly ---
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
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.write(`retry: 2000\n\n`);

        const onNew = (data: any) => {
            try {
                if (res.writableEnded) {
                    analyticsEmitter.off("new_chat", onNew);
                    return;
                }
                res.write(`event: new_chat\n`);
                res.write(`data: ${JSON.stringify(data)}\n\n`);
            } catch (e) {
                console.error("SSE write error:", e);
                analyticsEmitter.off("new_chat", onNew);
            }
        };

        analyticsEmitter.on("new_chat", onNew);

        req.on("close", () => {
            analyticsEmitter.off("new_chat", onNew);
            if (!res.writableEnded) {
                res.end();
            }
        });
    });
    
    return router;
}