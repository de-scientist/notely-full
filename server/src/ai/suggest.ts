import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from './../middleware/auth.ts';


router.post('/categories/suggest', async (req, res, next) => {
  try {
    const { title, synopsis, content, userId } = req.body;

    const userCategories = await prisma.category.findMany({ where: { userId } });
    const names = userCategories.map(c => c.name).join(', ');

    const prompt = `
      Categories: ${names}
      Note Title: ${title}
      Synopsis: ${synopsis}
      Content: ${content}

      Suggest the best category name.
    `;

    const ai = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    const suggestion = ai.choices[0].message.content.trim();
    const category = userCategories.find(c => c.name === suggestion);

    res.json({ suggestion, categoryId: category?.id ?? null });
  } catch (err) {
    next(err);
  }
});
