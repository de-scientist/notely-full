// /server/src/routes/notes.ts
import { Router, Request, Response } from "express"; // <--- FIX: Added Request, Response imports
import { generateFullNote } from "../services/aiServices.ts"; // Note: Changed .ts to a correct import path for Node/Express
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// POST /api/notes/generate
// body: { title, synopsis, audience, tone, length, save: boolean, authorId?, categoryId? }
router.post('/generate', async (req: Request, res: Response) => { // <--- FIX: Correct signature resolves Error 2769
    
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
    } = req.body; // <--- FIX: Destructuring inside function resolves Errors 2339
    
    // Server-side validation
    if (!authorId) {
        return res.status(401).json({ error: "User authentication required." });
    }
    
    // Ensure defaultCategoryId is treated as a string or undefined for type safety
    const defaultCategoryId: string | undefined = categoryId || process.env.DEFAULT_CATEGORY_ID; 

    if (save && !defaultCategoryId) {
        // FIX: Removed Number() call to fix Error 2349
        return res.status(400).json({ 
            error: "Saving the entry requires a 'categoryId'." 
        });
    }

    try {
        // 2. Build the prompt for the AI model
        const userPrompt = `Generate a ${length} note in Markdown format on the topic: "${title || synopsis}". 
            The target audience is ${audience} and the tone should be ${tone}. 
            The synopsis is: "${synopsis}". The main content should be formatted using Markdown headings (##, ###) and lists.
            DO NOT include the title or synopsis in the final note content, only the body.`;

        // 3. Call the AI model
        // Using generateFullNote from the import, assuming it returns { text: string }
        const response = await generateFullNote({ prompt: userPrompt }); // <--- FIX: Used imported function
        const generatedNote = response.text;
        let savedEntry = null;

        // 4. Save to database if requested
        if (save && defaultCategoryId) {
            
            // Cast the category ID to a string to satisfy Prisma's strict type checking (EntryCreateInput)
            const finalCategoryId = defaultCategoryId as string; // <--- FIX: Type casting to resolve Error 2322
            
            savedEntry = await prisma.entry.create({
                data: {
                    // Core Data
                    // Adjusted title fallback slightly for robustness
                    title: title || generatedNote.split('\n')[0].replace(/^[#>\-\*]+\s*/, '').trim().substring(0, 100),
                    synopsis: synopsis || title, 
                    content: generatedNote,
                    
                    // Relation Fields
                    categoryId: finalCategoryId, // Using the type-safe variable
                    user: { connect: { id: authorId } },
                    
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
        // FIX: Standard console.error call to resolve Error 2554
        // FIX: Cast error to 'any' for property access to resolve Errors 18046
        console.error('AI Note generation or save error:', error); 
        
        // Check if the error is a Prisma record not found error (P2025) or a foreign key constraint failure (P2003)
        if ((error as any).code === 'P2025' || (error as any).code === 'P2003') { 
            // FIX: Removed Number() call to fix Error 2349
            return res.status(400).json({ error: 'The specified User or Category ID does not exist.' });
        }
        // FIX: Removed Number() call to fix Error 2349
        return res.status(500).json({ error: 'Failed to generate or save note due to a server error.' });
    }
});

export default router;