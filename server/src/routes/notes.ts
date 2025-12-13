// /server/src/routes/notes.ts
import { Router, Request, Response } from "express"; 
import { generateFullNote } from "../services/aiServices.ts"; // <--- IMPORTANT: Removed .ts and assuming singular 'aiService' file name
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// POST /api/notes/generate
// body: { title, synopsis, audience, tone, length, save: boolean, authorId?, categoryId? }
router.post('/generate', async (req: Request, res: Response) => { 
    
    // 1. Destructure and validate required fields
    const { 
        title, 
        synopsis, 
        audience, 
        tone, 
        length, 
        save, 
        authorId,        
        categoryId        
    } = req.body; 
    
    // Server-side validation
    if (!authorId) {
        return res.status(401).json({ error: "User authentication required." });
    }
    
    // Ensure defaultCategoryId is treated as a string or undefined for type safety
    const defaultCategoryId: string | undefined = categoryId || process.env.DEFAULT_CATEGORY_ID; 

    if (save && !defaultCategoryId) {
        return res.status(400).json({ 
            error: "Saving the entry requires a 'categoryId'." 
        });
    }

    try {
        // 2. Call the AI model
        // FIX: Changed call signature to match aiService.ts (Resolves Error 2353)
        // FIX: Removed the userPrompt variable which is now constructed inside aiService
        const generatedNote: string = await generateFullNote({
            title, 
            synopsis, 
            audience, 
            tone, 
            length
        }); // <--- The function now returns the string directly. (Resolves Error 2339)
        
        let savedEntry = null;

        // 4. Save to database if requested
        if (save && defaultCategoryId) {
            
            // Cast the IDs to string for Prisma's strict type checking
            const finalCategoryId = defaultCategoryId as string; 
            const finalAuthorId = authorId as string; // <--- FIX: Casting authorId to string (Resolves Error 2322)
            
            savedEntry = await prisma.entry.create({
                data: {
                    // Core Data
                    title: title || generatedNote.split('\n')[0].replace(/^[#>\-\*]+\s*/, '').trim().substring(0, 100),
                    synopsis: synopsis || title, 
                    content: generatedNote,
                    
                    // Relation Fields
                    categoryId: finalCategoryId, 
                    
                    // FIX: Using the type-safe variable (finalAuthorId)
                    user: { connect: { id: finalAuthorId } },
                    
                    // Explicitly connect the category relation field
                    category: { connect: { id: finalCategoryId } }, 
                },
                select: { id: true },
            });
        }

        // 5. Send back the generated note and saved status
        return res.json({ 
            note: generatedNote, 
            saved: savedEntry 
        });

    } catch (error) {
        console.error('AI Note generation or save error:', error); 
        
        // Check if the error is a Prisma record not found error (P2025) or a foreign key constraint failure (P2003)
        if ((error as any).code === 'P2025' || (error as any).code === 'P2003') { 
            return res.status(400).json({ error: 'The specified User or Category ID does not exist.' });
        }
        return res.status(500).json({ error: 'Failed to generate or save note due to a server error.' });
    }
});

export default router;