"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
// POST /api/entries - create a new entry
router.post('/', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { title, synopsis, content } = req.body;
        if (!title || !synopsis || !content) {
            return res.status(400).json({ message: 'Title, synopsis and content are required.' });
        }
        const entry = await prisma_1.prisma.entry.create({
            data: {
                title,
                synopsis,
                content,
                userId,
            },
        });
        return res.status(201).json({ entry });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/entries - get all non-deleted entries for user
router.get('/', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const entries = await prisma_1.prisma.entry.findMany({
            where: { userId, isDeleted: false },
            orderBy: { dateCreated: 'desc' },
        });
        return res.json({ entries });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/entries/trash - get deleted entries
router.get('/trash', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const entries = await prisma_1.prisma.entry.findMany({
            where: { userId, isDeleted: true },
            orderBy: { dateCreated: 'desc' },
        });
        return res.json({ entries });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/entry/:id - get a specific non-deleted entry
router.get('/:id', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const entry = await prisma_1.prisma.entry.findFirst({
            where: { id, userId, isDeleted: false },
        });
        if (!entry) {
            return res.status(404).json({ message: 'Entry not found.' });
        }
        return res.json({ entry });
    }
    catch (err) {
        next(err);
    }
});
// PATCH /api/entry/:id - update entry
router.patch('/:id', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { title, synopsis, content } = req.body;
        const existing = await prisma_1.prisma.entry.findFirst({ where: { id, userId } });
        if (!existing || existing.isDeleted) {
            return res.status(404).json({ message: 'Entry not found.' });
        }
        const entry = await prisma_1.prisma.entry.update({
            where: { id },
            data: {
                title: title ?? existing.title,
                synopsis: synopsis ?? existing.synopsis,
                content: content ?? existing.content,
            },
        });
        return res.json({ entry });
    }
    catch (err) {
        next(err);
    }
});
// PATCH /api/entry/restore/:id - restore deleted entry
router.patch('/restore/:id', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const existing = await prisma_1.prisma.entry.findFirst({ where: { id, userId } });
        if (!existing || !existing.isDeleted) {
            return res.status(404).json({ message: 'Entry not found in trash.' });
        }
        const entry = await prisma_1.prisma.entry.update({
            where: { id },
            data: { isDeleted: false },
        });
        return res.json({ entry });
    }
    catch (err) {
        next(err);
    }
});
// DELETE /api/entry/:id - soft delete
router.delete('/:id', async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const existing = await prisma_1.prisma.entry.findFirst({ where: { id, userId } });
        if (!existing || existing.isDeleted) {
            return res.status(404).json({ message: 'Entry not found.' });
        }
        const entry = await prisma_1.prisma.entry.update({
            where: { id },
            data: { isDeleted: true },
        });
        return res.json({ entry });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
