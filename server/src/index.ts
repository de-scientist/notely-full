import express, { Request, Response, NextFunction } from "express"; // Added NextFunction for middleware typing
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { attachUser } from "./middleware/auth.ts";
import { errorHandler } from "./middleware/errorHandler.ts";
import authRouter from "./routes/auth.ts";
import entriesRouter from "./routes/entries.ts";
import categoriesRouter from "./routes/categories.ts";
import userRouter from "./routes/user.ts";
import { chatRoutes } from "./routes/chats.ts";
import { chatRoutes1 } from "./routes/chatRoutes.ts";
import { analyticsRoutes } from "./routes/analyticsRoutes.ts";
import { ragRoutes } from "./routes/ragRoutes.ts";
import oauthRoutes from "./routes/OAuth.ts";
import aiRoutes from "./routes/ai.routes.ts";
import notesRouter from "./routes/notes.ts";
import protectedRouter from "./routes/protected.ts";
import webhookRouter from "./routes/webhook.ts";

// Import new routes
import publicEntriesRouter from "./routes/publicRoutes.ts";
//import smartCategoryRouter from './routes/smartCategory.ts';
//import permanentDeleteRouter from './routes/permanentDelete.ts';

const prisma = new PrismaClient();
dotenv.config();

const app = express();

// --- FIX 1: Define rawBodyMiddleware ---
// This middleware is necessary for the webhook signature verification.
const rawBodyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (
    req.method === "POST" &&
    req.headers["content-type"] === "application/json"
  ) {
    let data = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      (req as any).rawBody = data; // Attach raw body to request object
      // Re-parse the JSON body for req.body after raw body is captured
      try {
        req.body = JSON.parse(data);
      } catch (e) {
        // Handle non-JSON body if needed
      }
      next();
    });
  } else {
    next();
  }
};
// ----------------------------------------

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);
// IMPORTANT: The rawBodyMiddleware must be placed before express.json() for the webhook to work correctly.
// Since you are using rawBodyMiddleware for a specific path, we will remove it from the global app.use
// and use express.json() globally.
// The webhook route (line 63) will be corrected to use the rawBodyMiddleware specifically.

// app.use(express.json()); // NOTE: We will use a conditional body parser later for the webhook
app.use(cookieParser());

// Global middleware for all routes *except* the webhook
app.use((req, res, next) => {
  if (req.originalUrl === "/webhook/supabase") {
    return next(); // Skip body parser for webhook
  }
  // Parse JSON body for all other routes
  express.json()(req, res, next);
});

// app.use(rawBodyMiddleware); // REMOVED: Applying globally caused issues. Will be applied locally.

app.use(attachUser);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Existing routes
app.use("/api/auth", authRouter);
app.use("/api/entries", entriesRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/user", userRouter);
app.use(chatRoutes());
app.use("/auth/oauth", oauthRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/notes", notesRouter);
app.use("/", chatRoutes1());
app.use("/", analyticsRoutes());
app.use("/", ragRoutes());

// New routes
app.use("/api/public/entries", publicEntriesRouter);
//app.use('/api/categories/suggest', smartCategoryRouter);
//app.use('/api/entries/permanent', permanentDeleteRouter);

// --- FIX 2 & 3: Correctly mounting the webhook router with rawBodyMiddleware ---
// A Router instance doesn't have a .handle() method. We must mount it like any other router.
// Crucially, we apply rawBodyMiddleware ONLY to this route, BEFORE it hits the webhookRouter logic.
app.use("/webhook/supabase", rawBodyMiddleware, webhookRouter);

app.use(errorHandler);

// error handling
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Server error" });
  },
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
