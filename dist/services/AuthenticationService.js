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
exports.login = void 0;
const PflegerModel_1 = require("../model/PflegerModel");
const PflegerService_1 = require("./PflegerService");
/**
 * Prüft Name und Passwort, bei Erfolg ist `success` true
 * und es wird die `id` und `role` ("u" oder "a") des Pflegers zurückgegeben
 *
 * Falls kein Pfleger mit gegebener Name existiert oder das Passwort falsch ist, wird nur
 * `false` zurückgegeben. Aus Sicherheitsgründen wird kein weiterer Hinweis gegeben.
 */
function login(name, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const list = yield (0, PflegerService_1.getAllePfleger)();
        for (let index = 0; index < list.length; index++) {
            if (list[index].name === name) {
                const pfleger = yield PflegerModel_1.Pfleger.findOne({ name: name }).exec();
                if (pfleger) {
                    if (yield pfleger.isCorrectPassword(password)) {
                        if (pfleger.admin) {
                            return { id: pfleger.id, role: "a" };
                        }
                        else {
                            return { id: pfleger.id, role: "u" };
                        }
                    }
                }
            }
        }
        return false;
    });
}
exports.login = login;
//# sourceMappingURL=AuthenticationService.js.map