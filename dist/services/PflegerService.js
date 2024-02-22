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
exports.deletePfleger = exports.updatePfleger = exports.createPfleger = exports.getAllePfleger = void 0;
const mongoose_1 = require("mongoose");
const EintragModel_1 = require("../model/EintragModel");
const PflegerModel_1 = require("../model/PflegerModel");
const ProtokollModel_1 = require("../model/ProtokollModel");
/**
 * Die Passwörter dürfen nicht zurückgegeben werden.
 */
function getAllePfleger() {
    return __awaiter(this, void 0, void 0, function* () {
        const pflegers = yield PflegerModel_1.Pfleger.find().exec();
        return pflegers.map(Pfleger => {
            return {
                id: Pfleger.id,
                name: Pfleger.name,
                admin: Pfleger.admin,
            };
        });
    });
}
exports.getAllePfleger = getAllePfleger;
/**
 * Erzeugt einen Pfleger. Das Password darf nicht zurückgegeben werden.
 */
function createPfleger(pflegerResource) {
    return __awaiter(this, void 0, void 0, function* () {
        const pfleger = yield PflegerModel_1.Pfleger.create({ name: pflegerResource.name, password: pflegerResource.password, admin: pflegerResource.admin });
        return {
            id: pfleger.id,
            name: pfleger.name,
            admin: pfleger.admin
        };
    });
}
exports.createPfleger = createPfleger;
/**
 * Updated einen Pfleger.
 * Beim Update wird der Pfleger über die ID identifiziert.
 * Der Admin kann einfach so ein neues Passwort setzen, ohne das alte zu kennen.
 */
function updatePfleger(pflegerResource) {
    return __awaiter(this, void 0, void 0, function* () {
        let foundPfleger = yield PflegerModel_1.Pfleger.findById(pflegerResource.id).exec();
        if (!foundPfleger) {
            throw Error("No pfleger with id " + pflegerResource.id + " could not been found.");
        }
        foundPfleger.name = pflegerResource.name;
        foundPfleger.admin = pflegerResource.admin;
        if (pflegerResource.password) {
            foundPfleger.password = pflegerResource.password;
        }
        yield foundPfleger.save();
        return {
            name: foundPfleger.name,
            admin: foundPfleger.admin,
            id: foundPfleger.id
        };
    });
}
exports.updatePfleger = updatePfleger;
/**
 * Beim Löschen wird der Pfleger über die ID identifiziert.
 * Falls Pfleger nicht gefunden wurde (oder aus
 * anderen Gründen nicht gelöscht werden kann) wird ein Fehler geworfen.
 * Wenn der Pfleger gelöscht wird, müssen auch alle zugehörigen Protokolls und Eintrags gelöscht werden.
 */
function deletePfleger(id) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!id) {
            throw new Error("No id given");
        }
        let pfe = yield PflegerModel_1.Pfleger.findById(id);
        const red = yield PflegerModel_1.Pfleger.deleteOne({ _id: new mongoose_1.Types.ObjectId(id) }).exec();
        if (red.deletedCount !== 1) {
            throw new Error("Pfleger not deleted");
        }
        else {
            yield ProtokollModel_1.Protokoll.deleteMany({ ersteller: pfe.id }).exec();
            yield EintragModel_1.Eintrag.deleteMany({ ersteller: pfe.id }).exec();
        }
    });
}
exports.deletePfleger = deletePfleger;
//# sourceMappingURL=PflegerService.js.map