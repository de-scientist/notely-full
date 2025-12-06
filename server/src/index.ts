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

// Import new routes
//import publicEntriesRouter from './routes/public.ts';
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

app.get('/api/public/entries/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Use the same logic you had in entryRoutes.ts for public access
        const entry = await prisma.entry.findUnique({
            where: { id },
            include: {
                category: { select: { id: true, name: true } },
            },
        });

        if (!entry || !entry.isPublic) {
            return res.status(404).json({ message: 'Entry not found or is private.' });
        }

        return res.json({ entry });

    } catch (err) {
        console.error("Error fetching public entry:", err);
        return res.status(500).json({ message: 'Server error fetching public note.' });
    }
});

// Existing routes
app.use('/api/auth', authRouter);
app.use('/api/entries', entriesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/user', userRouter);

// New routes
//app.use('/api/entries/public', publicEntriesRouter);
//app.use('/api/categories/suggest', smartCategoryRouter);
//app.use('/api/entries/permanent', permanentDeleteRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
