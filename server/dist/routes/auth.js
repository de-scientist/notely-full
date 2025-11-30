"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const TOKEN_COOKIE_NAME = 'token';
router.post('/register', async (req, res, next) => {
    try {
        const { firstName, lastName, username, email, password } = req.body;
        if (!firstName || !lastName || !username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        if (!(0, password_1.isPasswordStrong)(password)) {
            return res.status(400).json({ message: 'Password is too weak.' });
        }
        const existingByEmail = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existingByEmail) {
            return res.status(400).json({ message: 'Email already in use.' });
        }
        const existingByUsername = await prisma_1.prisma.user.findUnique({ where: { username } });
        if (existingByUsername) {
            return res.status(400).json({ message: 'Username already in use.' });
        }
        const passwordHash = await (0, password_1.hashPassword)(password);
        const user = await prisma_1.prisma.user.create({
            data: {
                firstName,
                lastName,
                username,
                email,
                password: passwordHash,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                email: true,
                avatar: true,
                dateJoined: true,
            },
        });
        return res.status(201).json({ user });
    }
    catch (err) {
        next(err);
    }
});
router.post('/login', async (req, res, next) => {
    try {
        const { identifier, password } = req.body;
        if (!identifier || !password) {
            return res.status(400).json({ message: 'Identifier and password are required.' });
        }
        const user = await prisma_1.prisma.user.findFirst({
            where: {
                OR: [{ email: identifier }, { username: identifier }],
            },
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        const valid = await (0, password_1.verifyPassword)(password, user.password);
        if (!valid) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        const token = (0, jwt_1.signToken)({ userId: user.id });
        res.cookie(TOKEN_COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        const safeUser = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
        };
        return res.json({ user: safeUser });
    }
    catch (err) {
        next(err);
    }
});
router.post('/logout', (req, res) => {
    res.clearCookie(TOKEN_COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });
    return res.json({ message: 'Logged out' });
});
router.post('/password', auth_1.requireAuth, async (req, res, next) => {
    try {
        const { currentPassword, newPassword, confirmNewPassword } = req.body;
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: 'New passwords do not match.' });
        }
        if (!(0, password_1.isPasswordStrong)(newPassword)) {
            return res.status(400).json({ message: 'New password is too weak.' });
        }
        const userId = req.user.id;
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const valid = await (0, password_1.verifyPassword)(currentPassword, user.password);
        if (!valid) {
            return res.status(400).json({ message: 'Current password is incorrect.' });
        }
        const newHash = await (0, password_1.hashPassword)(newPassword);
        await prisma_1.prisma.user.update({ where: { id: userId }, data: { password: newHash } });
        return res.json({ message: 'Password updated successfully.' });
    }
    catch (err) {
        next(err);
    }
});
router.get('/me', auth_1.requireAuth, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                email: true,
                avatar: true,
                dateJoined: true,
            },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        return res.json({ user });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
