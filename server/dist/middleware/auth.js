"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachUser = attachUser;
exports.requireAuth = requireAuth;
const jwt_1 = require("../utils/jwt");
const TOKEN_COOKIE_NAME = 'token';
function attachUser(req, _res, next) {
    const token = req.cookies?.[TOKEN_COOKIE_NAME];
    if (!token) {
        return next();
    }
    const payload = (0, jwt_1.verifyToken)(token);
    if (payload) {
        req.user = { id: payload.userId };
    }
    next();
}
function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    return next();
}
