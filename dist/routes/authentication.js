"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthentication = exports.requiresAuthentication = void 0;
const JWTService_1 = require("../services/JWTService");
function requiresAuthentication(req, res, next) {
    req.pflegerId = undefined;
    try {
        let jwtString = req.cookies["access_token"];
        if (!jwtString) {
            res.sendStatus(401);
        }
        const pfleger = (0, JWTService_1.verifyJWT)(jwtString);
        req.pflegerId = pfleger.id;
        req.role = pfleger.role;
        next();
    }
    catch (err) {
        res.status(401);
        return next(err);
    }
}
exports.requiresAuthentication = requiresAuthentication;
function optionalAuthentication(req, res, next) {
    req.pflegerId = undefined;
    let jwtString = req.cookies["access_token"];
    if (jwtString) {
        try {
            const pfleger = (0, JWTService_1.verifyJWT)(jwtString);
            if (pfleger.exp === 0) {
                res.sendStatus(401);
            }
            req.pflegerId = pfleger.id;
            req.role = pfleger.role;
            return next();
        }
        catch (err) {
            res.status(401);
            return next();
        }
    }
    next();
}
exports.optionalAuthentication = optionalAuthentication;
//# sourceMappingURL=authentication.js.map