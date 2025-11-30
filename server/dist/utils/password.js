"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.isPasswordStrong = isPasswordStrong;
const bcrypt_1 = __importDefault(require("bcrypt"));
const zxcvbn_1 = __importDefault(require("zxcvbn"));
const SALT_ROUNDS = 10;
async function hashPassword(plain) {
    return bcrypt_1.default.hash(plain, SALT_ROUNDS);
}
async function verifyPassword(plain, hash) {
    return bcrypt_1.default.compare(plain, hash);
}
function isPasswordStrong(password) {
    const result = (0, zxcvbn_1.default)(password);
    // Require at least score 3 (0-4)
    return result.score >= 3;
}
