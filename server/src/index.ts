import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { attachUser } from './middleware/auth.ts';
import { errorHandler } from './middleware/errorHandler.ts';
import authRouter from './routes/auth.ts';
import entriesRouter from './routes/entries.ts';
import categoriesRouter from './routes/categories.ts';
import userRouter from './routes/user.ts';
import { chatRoutes } from "./routes/chats.ts";
import { chatRoutes1 } from "./routes/chatRoutes.ts"; 
import { analyticsRoutes } from "./routes/analyticsRoutes.ts";
import { ragRoutes } from "./routes/ragRoutes.ts";
import oauthRoutes from './routes/OAuth.ts';
import aiRoutes from "./routes/ai.routes.ts";
import notesRouter from "./routes/notes.ts";

// Import new routes
import publicEntriesRouter from './routes/publicRoutes.ts';
//import smartCategoryRouter from './routes/smartCategory.ts';
//import permanentDeleteRouter from './routes/permanentDelete.ts';
const prisma = new PrismaClient();
dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(attachUser);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});


// Existing routes
app.use('/api/auth', authRouter);
app.use('/api/entries', entriesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/user', userRouter);
app.use(chatRoutes());
app.use('/auth/oauth', oauthRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/notes", notesRouter);
app.use("/", chatRoutes1()); 
app.use("/", analyticsRoutes()); 
app.use("/", ragRoutes());

// New routes
app.use('/api/public/entries', publicEntriesRouter);
//app.use('/api/categories/suggest', smartCategoryRouter);
//app.use('/api/entries/permanent', permanentDeleteRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
