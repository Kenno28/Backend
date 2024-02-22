"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJWT = exports.verifyPasswordAndCreateJWT = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const AuthenticationService_1 = require("./AuthenticationService");
function verifyPasswordAndCreateJWT(name, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const secret = process.env.JWT_SECRET;
        const TTL = Number.parseInt(process.env.JWT_TTL) * 1000;
        if (!secret || !TTL) {
            throw new Error("Secret is Undefined");
        }
        const isTrue = yield (0, AuthenticationService_1.login)(name, password);
        if (isTrue) {
            const payload = {
                sub: isTrue.id,
                role: isTrue.role
            };
            return (0, jsonwebtoken_1.sign)(payload, secret, {
                expiresIn: TTL,
                algorithm: "HS256"
            });
        }
    });
}
exports.verifyPasswordAndCreateJWT = verifyPasswordAndCreateJWT;
function verifyJWT(jwtString) {
    if (!jwtString) {
        throw new Error("String is not defined");
    }
    const secret = process.env.JWT_SECRET;
    const ttl = process.env.JWT_TTL;
    if (!secret || !ttl) {
        throw new Error("Secret or TTL is Undefined");
    }
    const payload = (0, jsonwebtoken_1.verify)(jwtString, secret);
    if (!payload) {
        throw jsonwebtoken_1.JsonWebTokenError;
    }
    if (payload instanceof Object) {
        return { id: payload.sub, role: payload.role, exp: payload.exp };
    }
    else {
        throw jsonwebtoken_1.JsonWebTokenError;
    }
}
exports.verifyJWT = verifyJWT;
//# sourceMappingURL=JWTService.js.map