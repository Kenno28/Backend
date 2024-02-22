// must be imported before any other imports
import dotenv from "dotenv";
dotenv.config();

import "restmatcher";
import supertest from "supertest";
import { PflegerResource, ProtokollResource } from "../../src/Resources";
import app from "../../src/app";
import { createPfleger } from "../../src/services/PflegerService";
import { createProtokoll } from "../../src/services/ProtokollService";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";

let pomfrey: PflegerResource
let fredsProtokoll: ProtokollResource

beforeEach(async () => {
    pomfrey = await createPfleger({
        name: "Poppy Pomfrey", password: "12345bcdABCD..;,.", admin: false
    });
    fredsProtokoll = await createProtokoll({
        patient: "Fred Weasly", datum: "01.10.2023",
        public: true, closed: false,
        ersteller: pomfrey.id!
    })
    await performAuthentication("Poppy Pomfrey", "12345bcdABCD..;,.");
})

test("/api/protokoll GET, ungültige ID", async () => {
    const testee = supertestWithAuth(app);
    const response = await testee.get(`/api/protokoll/1234`)

    expect(response).toHaveValidationErrorsExactly({ status: "400", params: "id" })
})

test("/api/protokoll PUT, verschiedene ID (params und body)", async () => {
    const testee = supertestWithAuth(app);
    // Hint: Gültige ID, aber für ein Protokoll ungültig!
    const invalidProtokollID = pomfrey.id;
    // Hint: Gebe hier Typ an, um im Objektliteral Fehler zu vermeiden!
    const update: ProtokollResource = { 
        ...fredsProtokoll, // Hint: Kopie von fredsProtokoll
        id: invalidProtokollID, // wir "überschreiben" die ID
        patient: "George Weasly" // und den Patienten
    }
    const response = await testee.put(`/api/protokoll/${fredsProtokoll.id}`).send(update);

    expect(response).toHaveValidationErrorsExactly({ status: "400", params: "id", body: "id" })
});
