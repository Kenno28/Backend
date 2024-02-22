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
exports.pflegerRouter = void 0;
const express_1 = __importDefault(require("express"));
const H = __importStar(require("../services/PflegerService"));
const express_validator_1 = require("express-validator");
const authentication_1 = require("./authentication");
exports.pflegerRouter = express_1.default.Router();
exports.pflegerRouter.get("/alle", authentication_1.optionalAuthentication, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.role !== "a") {
        return res.status(401).send("Not an Admin");
    }
    try {
        const pflegerUser = yield H.getAllePfleger();
        res.send(pflegerUser);
        return;
    }
    catch (error) {
        res.status(400);
        next(error);
        return;
    }
}));
exports.pflegerRouter.post("/", authentication_1.requiresAuthentication, (0, express_validator_1.body)("name").isString().isLength({ min: 1, max: 100 }), (0, express_validator_1.body)("admin").optional().isBoolean(), (0, express_validator_1.body)("password").isString().isStrongPassword().isLength({ min: 1, max: 100 }), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400)
            .json({ errors: errors.array() });
    }
    try {
        const pflegerData = (0, express_validator_1.matchedData)(req);
        if (req.role !== "a") {
            return res.status(401).send("Not an Admin");
        }
        const createPflegerResource = yield H.createPfleger(pflegerData);
        res.status(201).send(createPflegerResource);
        return;
    }
    catch (err) {
        res.status(400);
        next(err);
        return;
    }
}));
exports.pflegerRouter.put("/:id", authentication_1.requiresAuthentication, (0, express_validator_1.body)("id").isMongoId(), (0, express_validator_1.param)("id").isMongoId(), (0, express_validator_1.body)("name").isString().isLength({ min: 1, max: 100 }), (0, express_validator_1.body)("admin").isBoolean(), (0, express_validator_1.body)("password").optional().isString().isStrongPassword().isLength({ min: 1, max: 100 }), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400)
            .json({ errors: errors.array() });
    }
    const id = req.params.id;
    if (id !== req.body.id) {
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
                    value: req.body.id
                }
            ]
        });
    }
    try {
        const pflegerData = (0, express_validator_1.matchedData)(req);
        if (req.role !== "a") {
            return res.sendStatus(401).send("Not an Admin");
        }
        // if(pflegerData.id !== req.pflegerId){
        //      return res.status(400).send("pflegerId inkonsistent");
        //  }
        const updatePfleger = yield H.updatePfleger(pflegerData);
        return res.status(200).send(updatePfleger);
    }
    catch (err) {
        res.status(400);
        next(err);
        return;
    }
}));
exports.pflegerRouter.delete("/:id", authentication_1.requiresAuthentication, (0, express_validator_1.param)("id").isMongoId(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400)
            .json({ errors: errors.array() });
    }
    if (req.role !== "a") {
        return res.status(401).send("Not an Admin");
    }
    if (req.pflegerId === id) {
        return res.status(403).send("Can not delete yourself");
    }
    try {
        yield H.deletePfleger(id);
        return res.status(204).send();
    }
    catch (error) {
        res.status(400);
        next(error);
        return;
    }
}));
//# sourceMappingURL=pfleger.js.map