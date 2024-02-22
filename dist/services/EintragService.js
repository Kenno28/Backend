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
exports.deleteEintrag = exports.updateEintrag = exports.createEintrag = exports.getEintrag = exports.getAlleEintraege = void 0;
const mongoose_1 = require("mongoose");
const EintragModel_1 = require("../model/EintragModel");
const PflegerModel_1 = require("../model/PflegerModel");
const ProtokollModel_1 = require("../model/ProtokollModel");
const ServiceHelper_1 = require("./ServiceHelper");
//Alles was undefined sein könnte sollen wir dann als undefined zurückschicken
/**
 * Gibt alle Eintraege in einem Protokoll zurück.
 * Wenn das Protokoll nicht gefunden wurde, wird ein Fehler geworfen.
 */
function getAlleEintraege(protokollId) {
    return __awaiter(this, void 0, void 0, function* () {
        const ein = yield EintragModel_1.Eintrag.find({ protokoll: protokollId }).exec();
        const pro = yield ProtokollModel_1.Protokoll.findById(protokollId).exec();
        if (!pro) {
            throw Error("Protokoll does not Exist");
        }
        const pfe = yield PflegerModel_1.Pfleger.findById(pro.ersteller).exec();
        if (!pfe) {
            throw Error("Pfleger does not Exist");
        }
        return ein.map(Eintrag => {
            return {
                id: Eintrag.id.toString(),
                getraenk: Eintrag.getraenk,
                menge: Eintrag.menge,
                kommentar: Eintrag.kommentar,
                ersteller: Eintrag.ersteller.toString(),
                erstellerName: pfe.name,
                createdAt: (0, ServiceHelper_1.dateToString)(Eintrag.createdAt),
                protokoll: Eintrag.protokoll.id.toString()
            };
        });
    });
}
exports.getAlleEintraege = getAlleEintraege;
/**
 * Liefert die EintragResource mit angegebener ID.
 * Falls kein Eintrag gefunden wurde, wird ein Fehler geworfen.
 */
function getEintrag(id) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!id) {
            throw new Error("no valid Id");
        }
        const ein = yield EintragModel_1.Eintrag.findById(id).exec();
        if (!ein) {
            throw Error("Eintrag does not Exist");
        }
        const pfe = yield PflegerModel_1.Pfleger.findById(ein.ersteller).exec();
        if (!pfe) {
            throw Error("Pfleger does not Exist");
        }
        const pro = yield ProtokollModel_1.Protokoll.findById(ein.protokoll).exec();
        if (!pro) {
            throw Error("Protokoll does not Exist");
        }
        return {
            id: ein.id,
            getraenk: ein.getraenk,
            menge: ein.menge,
            kommentar: ein.kommentar,
            ersteller: ein.ersteller.toString(),
            erstellerName: pfe.name,
            createdAt: (0, ServiceHelper_1.dateToString)(ein.createdAt),
            protokoll: pro.id
        };
    });
}
exports.getEintrag = getEintrag;
/**
 * Erzeugt eine Eintrag.
 * Daten, die berechnet werden aber in der gegebenen Ressource gesetzt sind, werden ignoriert.
 * Falls die Liste geschlossen (done) ist, wird ein Fehler wird geworfen.
 */
function createEintrag(eintragResource) {
    return __awaiter(this, void 0, void 0, function* () {
        const pfleger = yield PflegerModel_1.Pfleger.findById(eintragResource.ersteller).exec();
        if (!pfleger) {
            throw new Error(`No pfleger found with id ${eintragResource.ersteller}`);
        }
        const protokoll = yield ProtokollModel_1.Protokoll.findById(eintragResource.protokoll).exec();
        if (!protokoll) {
            throw new Error(`No protokoll found with id ${eintragResource.protokoll}`);
        }
        if (protokoll.closed) {
            throw new Error(`Protokoll ${protokoll.id} is already closed`);
        }
        const eintrag = yield EintragModel_1.Eintrag.create({
            getraenk: eintragResource.getraenk,
            menge: eintragResource.menge,
            kommentar: eintragResource.kommentar,
            ersteller: eintragResource.ersteller,
            protokoll: eintragResource.protokoll
        });
        return {
            id: eintrag.id,
            getraenk: eintrag.getraenk,
            menge: eintrag.menge,
            kommentar: eintrag.kommentar,
            ersteller: pfleger.id,
            erstellerName: pfleger.name,
            createdAt: (0, ServiceHelper_1.dateToString)(eintrag.createdAt),
            protokoll: protokoll.id
        };
    });
}
exports.createEintrag = createEintrag;
/**
 * Updated eine Eintrag. Es können nur Name, Quantity und Remarks geändert werden.
 * Aktuell können Eintrags nicht von einem Protokoll in einen anderen verschoben werden.
 * Auch kann der Creator nicht geändert werden.
 * Falls die Protokoll oder Creator geändert wurde, wird dies ignoriert.
 */
function updateEintrag(eintragResource) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!eintragResource) {
            throw Error("is Null");
        }
        const ein = yield EintragModel_1.Eintrag.findById(eintragResource.id).exec();
        if (!ein) {
            throw Error("Eintrag nicht gefunden");
        }
        const pfe = yield PflegerModel_1.Pfleger.findById(ein.ersteller).exec();
        if (!pfe) {
            throw Error("Pfleger does not Exist");
        }
        const pro = yield ProtokollModel_1.Protokoll.findById(ein.protokoll).exec();
        if (!pro) {
            throw Error("Protocol does not Exist");
        }
        ein.getraenk = eintragResource.getraenk;
        ein.menge = eintragResource.menge;
        ein.kommentar = eintragResource.kommentar;
        yield ein.save();
        return {
            id: ein.id,
            getraenk: ein.getraenk,
            menge: ein.menge,
            kommentar: ein.kommentar,
            ersteller: ein.ersteller.toString(),
            erstellerName: pfe.name,
            createdAt: (0, ServiceHelper_1.dateToString)(ein.createdAt),
            protokoll: pro.id
        };
    });
}
exports.updateEintrag = updateEintrag;
/**
 * Beim Löschen wird das Eintrag über die ID identifiziert.
 * Falls es nicht gefunden wurde (oder aus
 * anderen Gründen nicht gelöscht werden kann) wird ein Fehler geworfen.
 */
function deleteEintrag(id) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!id) {
            throw new Error("No id given");
        }
        const red = yield EintragModel_1.Eintrag.deleteOne({ _id: new mongoose_1.Types.ObjectId(id) }).exec();
        if (red.deletedCount !== 1) {
            throw new Error("Eintrag not deleted");
        }
    });
}
exports.deleteEintrag = deleteEintrag;
//# sourceMappingURL=EintragService.js.map