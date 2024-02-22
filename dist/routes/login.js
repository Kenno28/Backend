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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginRouter = void 0;
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const JWTService_1 = require("../services/JWTService");
exports.loginRouter = express_1.default.Router();
exports.loginRouter.post("/", (0, express_validator_1.body)("name").isString().isLength({ min: 1, max: 100 }), (0, express_validator_1.body)("password").isString().isStrongPassword().isLength({ min: 1, max: 100 }), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400)
            .json({ errors: errors.array() });
    }
    try {
        const loginData = (0, express_validator_1.matchedData)(req);
        const jwtTokenString = yield (0, JWTService_1.verifyPasswordAndCreateJWT)(loginData.name, loginData.password);
        const log = (0, JWTService_1.verifyJWT)(jwtTokenString);
        res.cookie("access_token", jwtTokenString, { httpOnly: true,
            secure: true,
            expires: new Date(Date.now() + 3600000),
            sameSite: 'none' });
        res.status(201).send(log);
        return;
    }
    catch (error) {
        res.sendStatus(200); //Sollen wir so machen
        next(error);
        return;
    }
}));
exports.loginRouter.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jwtString = req.cookies.access_token;
        const loginData = (0, JWTService_1.verifyJWT)(jwtString);
        res.status(200).send(loginData);
        return;
    }
    catch (error) {
        res.status(400); // most likley falsch
        res.clearCookie("access_token", {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            expires: new Date(0)
        });
        res.send(false);
        next(error);
        return;
    }
}));
exports.loginRouter.delete("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("access_token", {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        expires: new Date(0)
    });
    res.sendStatus(204);
    next();
    return;
}));
//# sourceMappingURL=login.js.map