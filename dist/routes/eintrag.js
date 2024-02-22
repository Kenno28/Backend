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
exports.eintragRouter = void 0;
const express_1 = __importDefault(require("express"));
const Eintrag = __importStar(require("../services/EintragService"));
const express_validator_1 = require("express-validator");
const authentication_1 = require("./authentication");
const ProtokollService_1 = require("../services/ProtokollService");
exports.eintragRouter = express_1.default.Router();
exports.eintragRouter.post("/", authentication_1.requiresAuthentication, (0, express_validator_1.body)("getraenk").isString().isLength({ min: 1, max: 100 }), (0, express_validator_1.body)("kommentar").optional().isString().isLength({ min: 1, max: 1000 }), (0, express_validator_1.body)("menge").isNumeric(), (0, express_validator_1.body)("ersteller").isMongoId(), (0, express_validator_1.body)("erstellerName").optional().isString().isLength({ min: 1, max: 100 }), (0, express_validator_1.body)("createdAt").optional().isString().isLength({ min: 1, max: 100 }), (0, express_validator_1.body)("protokoll").isMongoId(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400)
            .json({ errors: errors.array() });
    }
    try {
        const eintragData = (0, express_validator_1.matchedData)(req);
        const protokoll = yield (0, ProtokollService_1.getProtokoll)(eintragData.protokoll);
        if ((req.pflegerId !== protokoll.ersteller) && protokoll.public === false) { //testen
            res.sendStatus(403);
            next();
            return;
        }
        const createEintragResource = yield Eintrag.createEintrag(eintragData);
        return res.status(201).send(createEintragResource);
    }
    catch (error) {
        res.sendStatus(404);
        next(error);
        return;
    }
}));
exports.eintragRouter.get("/:id", authentication_1.optionalAuthentication, (0, express_validator_1.param)("id").isMongoId(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400)
            .json({ errors: errors.array() });
    }
    let id = req.params.id;
    try {
        const eintrag = yield Eintrag.getEintrag(id);
        const pro = yield (0, ProtokollService_1.getProtokoll)(eintrag.protokoll);
        if (pro.public) {
            return res.status(200).send(eintrag);
        }
        else if (!pro.public && (req.pflegerId === eintrag.ersteller || req.pflegerId === pro.ersteller)) {
            return res.status(200).send(eintrag);
        }
        else {
            res.sendStatus(403);
            next();
            return;
        }
    }
    catch (error) {
        res.sendStatus(404);
        next(error);
        return;
    }
}));
exports.eintragRouter.put("/:id", authentication_1.requiresAuthentication, (0, express_validator_1.param)("id").isMongoId(), (0, express_validator_1.body)("id").isMongoId(), (0, express_validator_1.body)("menge").isNumeric(), (0, express_validator_1.body)("getraenk").isString().isLength({ min: 1, max: 100 }), (0, express_validator_1.body)("kommentar").optional().isString().isLength({ min: 1, max: 1000 }), (0, express_validator_1.body)("ersteller").isMongoId(), (0, express_validator_1.body)("erstellerName").optional().isString().isLength({ min: 1, max: 100 }), (0, express_validator_1.body)("createdAt").optional().isString().isLength({ min: 1, max: 100 }), (0, express_validator_1.body)("protokoll").isMongoId(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400)
            .json({ errors: errors.array() });
    }
    let id = req.params.id;
    try {
        const eintragData = (0, express_validator_1.matchedData)(req);
        if (id !== eintragData.id) {
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
                        value: eintragData.id
                    }
                ]
            });
        }
        let ein = yield Eintrag.getEintrag(id);
        let pro = yield (0, ProtokollService_1.getProtokoll)(ein.protokoll);
        if (req.pflegerId === ein.ersteller || req.pflegerId === pro.ersteller) {
            const ein = yield Eintrag.updateEintrag(eintragData);
            return res.status(200).send(ein);
        }
        else {
            res.sendStatus(403);
            next();
            return;
        }
    }
    catch (error) {
        res.sendStatus(404);
        next(error);
        return;
    }
}));
exports.eintragRouter.delete("/:id", authentication_1.requiresAuthentication, (0, express_validator_1.param)("id").isMongoId(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400)
            .json({ errors: errors.array() });
    }
    let id = req.params.id;
    try {
        let ein = yield Eintrag.getEintrag(id);
        let pro = yield (0, ProtokollService_1.getProtokoll)(ein.protokoll);
        if (req.pflegerId === ein.ersteller || req.pflegerId === pro.ersteller) {
            yield Eintrag.deleteEintrag(id);
            res.status(204).send();
            return;
        }
        else {
            res.sendStatus(403);
            next();
            return;
        }
    }
    catch (error) {
        res.sendStatus(404);
        next(error);
        return;
    }
}));
//# sourceMappingURL=eintrag.js.map