// /server/src/routes/notes.ts
import { Router, Request, Response } from "express"; 
import { generateFullNote } from "../services/aiServices.ts"; 
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// POST /api/notes/generate
// body: { title, synopsis, audience, tone, length, save: boolean, authorId?, categoryId? }
router.post('/generate', async (req: Request, res: Response) => { 
    
    // 1. Destructure and validate required fields
    // FIX: Explicitly treating destructured body properties as (string | undefined) to resolve Error 2532 later
    const { 
        title, 
        synopsis, 
        audience, 
        tone, 
        length, 
        save, 
        authorId,        
        categoryId        
    } = req.body as { 
        title?: string, synopsis?: string, audience?: string, tone?: string, length?: string, 
        save?: boolean, authorId?: string, categoryId?: string 
    };
    
    // Server-side validation
    if (!authorId) {
        return res.status(401).json({ error: "User authentication required." });
    }
    
    const defaultCategoryId: string | undefined = categoryId || process.env.DEFAULT_CATEGORY_ID; 

    if (save && !defaultCategoryId) {
        return res.status(400).json({ 
            error: "Saving the entry requires a 'categoryId'." 
        });
    }

    try {
        // 2. Call the AI model
        const generatedNote: string = await generateFullNote({
            title, 
            synopsis, 
            audience, 
            tone, 
            length
        });
        
        let savedEntry = null;

        // 4. Save to database if requested
        if (save && defaultCategoryId) {
            
            const finalCategoryId = defaultCategoryId as string; 
            const finalAuthorId = authorId as string; 
            
            // Generate a fallback title from the note if none was provided
            const fallbackTitle = generatedNote.split('\n')[0].replace(/^[#>\-\*]+\s*/, '').trim().substring(0, 100);
            
            savedEntry = await prisma.entry.create({
                data: {
                    // Core Data
                    // FIX: Using nullish coalescing (??) or logical OR to safely assign the string value.
                    // This resolves Error 2532
                    title: (title || fallbackTitle) as string,
                    synopsis: (synopsis || title || fallbackTitle) as string, 
                    content: generatedNote,
                    
                    // Relation Fields (Using Unchecked Create Input pattern)
                    // We only provide the foreign keys, NOT the relation objects.
                    categoryId: finalCategoryId, 
                    userId: finalAuthorId,
                    
                    // FIX: Removed 'category: { connect: ... }'. 
                    // This resolves Error 2322 because setting 'categoryId' is enough for Unchecked Input.
                    // category: { connect: { id: finalCategoryId } }, <--- REMOVED
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
        
        if ((error as any).code === 'P2025' || (error as any).code === 'P2003') { 
            return res.status(400).json({ error: 'The specified User or Category ID does not exist.' });
        }
        return res.status(500).json({ error: 'Failed to generate or save note due to a server error.' });
    }
});

export default router;