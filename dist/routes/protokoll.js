"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.protokollRouter = void 0;
const express_1 = __importDefault(require("express"));
const EintragService_1 = require("../services/EintragService");
const pro = __importStar(require("../services/ProtokollService"));
const express_validator_1 = require("express-validator");
const authentication_1 = require("./authentication");
exports.protokollRouter = express_1.default.Router();
exports.protokollRouter.get("/:id/eintraege", authentication_1.optionalAuthentication, (0, express_validator_1.param)("id").isMongoId(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400)
            .json({ errors: errors.array() });
    }
    const id = req.params.id;
    try {
        const eintraege = yield (0, EintragService_1.getAlleEintraege)(id);
        res.send(eintraege); // 200 by default
    }
    catch (err) {
        res.status(404); // not found
        next(err);
    }
}));
exports.protokollRouter.post("/", authentication_1.requiresAuthentication, (0, express_validator_1.body)("patient").isString().isLength({ min: 1, max: 10 }), (0, express_validator_1.body)("datum").isString().isLength({ min: 1, max: 100 }), (0, express_validator_1.body)("public").optional().isBoolean(), (0, express_validator_1.body)("closed").optional().isBoolean(), (0, express_validator_1.body)("ersteller").isMongoId(), (0, express_validator_1.body)("erstellerName").optional().isString().isLength({ min: 1, max: 100 }), (0, express_validator_1.body)("updatedAt").optional().isString().isLength({ min: 1, max: 100 }), (0, express_validator_1.body)("gesamtMenge").optional().isNumeric(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400)
            .json({ errors: errors.array() });
    }
    try {
        const protokollData = (0, express_validator_1.matchedData)(req);
        if (protokollData.ersteller != req.pflegerId) {
            return res.status(400).send("pflegerId inkonsistent");
        }
        const createdProtokoll = yield pro.createProtokoll(protokollData);
        res.status(201).send(createdProtokoll);
    }
    catch (error) {
        res.status(404);
        next(error);
    }
}));
exports.protokollRouter.get("/alle", authentication_1.optionalAuthentication, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.pflegerId;
    console.log("A" + id);
    try {
        const allPro = yield pro.getAlleProtokolle(id);
        res.send(allPro);
    }
    catch (error) {
        res.sendStatus(400);
        next(error);
    }
}));
exports.protokollRouter.get("/:id", authentication_1.optionalAuthentication, (0, express_validator_1.param)("id").isMongoId(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400)
            .json({ errors: errors.array() }).send();
    }
    try {
        const foundProtokoll = yield pro.getProtokoll(req.params.id);
        //Wenn das Protokoll öffentlich ist, dann gib es zurück
        if (foundProtokoll.public) {
            res.status(200).send(foundProtokoll);
        }
        //Wenn es Privat ist und der Ersteller der angegebene Pfleger ist, dann gib das Protokoll zurück
        if (!foundProtokoll.public && foundProtokoll.ersteller === req.pflegerId) {
            res.status(200).send(foundProtokoll); //testen ob, wenn anderer pfleger und private
        }
        else {
            res.sendStatus(401);
            next();
        }
    }
    catch (error) {
        res.sendStatus(404);
        next(error);
        return;
    }
}));
exports.protokollRouter.put("/:id", authentication_1.requiresAuthentication, (0, express_validator_1.param)("id").isMongoId(), (0, express_validator_1.body)("id").isMongoId(), (0, express_validator_1.body)("patient").isString().isLength({ min: 1, max: 100 }), (0, express_validator_1.body)("datum").isString().isLength({ min: 1, max: 100 }), (0, express_validator_1.body)("public").optional().isBoolean(), (0, express_validator_1.body)("closed").optional().isBoolean(), (0, express_validator_1.body)("ersteller").isMongoId(), (0, express_validator_1.body)("erstellerName").optional().isString().isLength({ min: 1, max: 100 }), (0, express_validator_1.body)("updatedAt").optional().isString().isLength({ min: 1, max: 100 }), (0, express_validator_1.body)("gesamtMenge").optional().isNumeric(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400)
            .json({ errors: errors.array() });
    }
    const id = req.params.id;
    try {
        const protokollData = (0, express_validator_1.matchedData)(req);
        if (id !== protokollData.id) {
            return res.status(400).json({
                errors: [
                    {
                        location: "params",
                        param: "id",
                        value: id
                    },
                    {
                        location: "body",
                        param: "id",
                        value: protokollData.id
                    }
                ]
            });
        }
        if (protokollData.ersteller !== req.pflegerId) {
            res.sendStatus(403);
            next();
        }
        const prot = yield pro.updateProtokoll(protokollData);
        res.status(200).send(prot);
    }
    catch (error) {
        res.sendStatus(404);
        next(error);
    }
}));
exports.protokollRouter.delete("/:id", authentication_1.requiresAuthentication, (0, express_validator_1.param)("id").isMongoId(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400)
            .json({ errors: errors.array() });
    }
    try {
        const prop = yield pro.getProtokoll(req.params.id);
        if (prop.ersteller !== req.pflegerId) { //testen
            res.sendStatus(403);
            next();
        }
        yield pro.deleteProtokoll(req.params.id);
        res.sendStatus(204);
    }
    catch (error) {
        res.sendStatus(400);
        next(error);
    }
}));
//# sourceMappingURL=protokoll.js.map