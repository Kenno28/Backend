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
exports.deleteProtokoll = exports.updateProtokoll = exports.createProtokoll = exports.getProtokoll = exports.getAlleProtokolle = void 0;
const mongoose_1 = require("mongoose");
const EintragModel_1 = require("../model/EintragModel");
const PflegerModel_1 = require("../model/PflegerModel");
const ProtokollModel_1 = require("../model/ProtokollModel");
const ServiceHelper_1 = require("./ServiceHelper");
// .filter https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
/**
 * Gibt alle Protokolls zurück, die für einen Pfleger sichtbar sind. Dies sind:
 * - alle öffentlichen (public) Protokolls
 * - alle eigenen Protokolls, dies ist natürlich nur möglich, wenn die pflegerId angegeben ist.
 */
function getAlleProtokolle(pflegerId) {
    return __awaiter(this, void 0, void 0, function* () {
        // public Protokolls
        let protokolls = yield ProtokollModel_1.Protokoll.find({ public: true }).exec();
        if (pflegerId) {
            // private Protokolls
            const privateProtokolls = yield ProtokollModel_1.Protokoll.find({ ersteller: pflegerId, public: false }).exec();
            // Combine public & private Protokolls, so there R no duplicates
            protokolls = [...protokolls, ...privateProtokolls.filter(privateProtokoll => !protokolls.some(publicProtokoll => publicProtokoll._id.equals(privateProtokoll._id)))];
        }
        // die gesamtMenge für jedes Protokoll berechnen und es zu ProtokollResource konvertieren
        const protokollResource = yield Promise.all(protokolls.map((protokoll) => __awaiter(this, void 0, void 0, function* () {
            const eintraege = yield EintragModel_1.Eintrag.find({ protokoll: protokoll._id }).exec();
            const gesamtmenge = eintraege.reduce((sum, eintrag) => sum + eintrag.menge, 0);
            const pflegerbeispiel = yield PflegerModel_1.Pfleger.findById(protokoll.ersteller).exec();
            return {
                id: protokoll._id.toString(),
                patient: protokoll.patient,
                datum: (0, ServiceHelper_1.dateToString)(protokoll.datum),
                public: protokoll.public,
                closed: protokoll.closed,
                ersteller: protokoll.ersteller.toString(),
                erstellerName: pflegerbeispiel === null || pflegerbeispiel === void 0 ? void 0 : pflegerbeispiel.name,
                gesamtMenge: gesamtmenge,
                updatedAt: (0, ServiceHelper_1.dateToString)(protokoll.updatedAt)
            };
        })));
        return protokollResource;
    });
}
exports.getAlleProtokolle = getAlleProtokolle;
/**
 * Liefer die Protokoll mit angegebener ID.
* Falls keine Protokoll gefunden wurde, wird ein Fehler geworfen.
*/
function getProtokoll(id) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!id || id === "") {
            throw Error("no Id given");
        }
        const protokoll = yield ProtokollModel_1.Protokoll.findById(id).exec();
        let gesamteMenge = 0;
        if (!protokoll) {
            throw Error("No protocol found");
        }
        const pfleger = yield PflegerModel_1.Pfleger.findById(protokoll === null || protokoll === void 0 ? void 0 : protokoll.ersteller).exec();
        if (!pfleger) {
            throw Error("no such Pfleger found");
        }
        try {
            let ein = yield EintragModel_1.Eintrag.find({ protokoll: id }).exec();
            for (let index = 0; index < ein.length; index++) {
                const element = ein[index];
                gesamteMenge += element.menge;
            }
        }
        catch (_a) { }
        return {
            id: protokoll.id,
            patient: protokoll.patient,
            datum: (0, ServiceHelper_1.dateToString)(protokoll.datum),
            public: protokoll.public,
            closed: protokoll.closed,
            ersteller: protokoll.ersteller.toString(),
            erstellerName: pfleger.name,
            updatedAt: (0, ServiceHelper_1.dateToString)(protokoll.updatedAt),
            gesamtMenge: gesamteMenge
        };
    });
}
exports.getProtokoll = getProtokoll;
/**
 * Erzeugt das Protokoll.
 */
function createProtokoll(protokollResource) {
    return __awaiter(this, void 0, void 0, function* () {
        const as = yield PflegerModel_1.Pfleger.findById(protokollResource.ersteller).exec();
        if (!as) {
            throw new Error("No Pfleger found");
        }
        const protokoll = yield ProtokollModel_1.Protokoll.create({ id: protokollResource.id, patient: protokollResource.patient, datum: (0, ServiceHelper_1.stringToDate)(protokollResource.datum), public: protokollResource.public, closed: protokollResource.closed, ersteller: protokollResource.ersteller });
        return {
            id: protokoll.id,
            patient: protokoll.patient,
            datum: (0, ServiceHelper_1.dateToString)(protokoll.datum),
            public: protokoll.public,
            closed: protokoll.closed,
            ersteller: as.id,
            erstellerName: as.name,
            updatedAt: (0, ServiceHelper_1.dateToString)(protokoll.updatedAt)
        };
    });
}
exports.createProtokoll = createProtokoll;
/**
 * Ändert die Daten einer Protokoll.
 */
function updateProtokoll(protokollResource) {
    return __awaiter(this, void 0, void 0, function* () {
        const foundprotkoll = yield ProtokollModel_1.Protokoll.findById(protokollResource.id).exec();
        if (!foundprotkoll) {
            throw new Error("No protocol been found");
        }
        foundprotkoll.patient = protokollResource.patient;
        foundprotkoll.datum = (0, ServiceHelper_1.stringToDate)(protokollResource.datum);
        foundprotkoll.public = protokollResource.public;
        foundprotkoll.ersteller = new mongoose_1.Types.ObjectId(protokollResource.ersteller);
        foundprotkoll.closed = protokollResource.closed;
        yield foundprotkoll.save();
        let pro = yield ProtokollModel_1.Protokoll.findById(foundprotkoll.id).exec();
        if (!pro) {
        }
        let pfe = yield PflegerModel_1.Pfleger.findById(pro.ersteller).exec();
        return {
            id: foundprotkoll.id,
            patient: foundprotkoll.patient,
            datum: (0, ServiceHelper_1.dateToString)(foundprotkoll.datum),
            public: foundprotkoll.public,
            closed: foundprotkoll.closed,
            ersteller: foundprotkoll.ersteller.toString(),
            erstellerName: pfe.name,
            gesamtMenge: protokollResource.gesamtMenge,
            updatedAt: (0, ServiceHelper_1.dateToString)(pro.updatedAt)
        };
    });
}
exports.updateProtokoll = updateProtokoll;
/**
 * Beim Löschen wird die Protokoll über die ID identifiziert.
 * Falls keine Protokoll nicht gefunden wurde (oder aus
 * anderen Gründen nicht gelöscht werden kann) wird ein Fehler geworfen.
 * Wenn die Protokoll gelöscht wird, müssen auch alle zugehörigen Eintrags gelöscht werden.
 */
function deleteProtokoll(id) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!id) {
            throw Error("No id given");
        }
        let pro = yield ProtokollModel_1.Protokoll.findById(id).exec();
        const red = yield ProtokollModel_1.Protokoll.deleteOne({ _id: new mongoose_1.Types.ObjectId(id) }).exec();
        if (red.deletedCount !== 1) {
            throw Error("Protocol not deleted");
        }
        else {
            yield EintragModel_1.Eintrag.deleteMany({ protokoll: pro.id });
        }
    });
}
exports.deleteProtokoll = deleteProtokoll;
//# sourceMappingURL=ProtokollService.js.map