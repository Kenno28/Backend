// @ts-nocxheck
import dotenv from "dotenv";
dotenv.config();

import "restmatcher";
import supertest from "supertest";
import app from "../../src/app";
import * as pfleger from  "../../src/services/PflegerService";
import { createProtokoll } from "../../src/services/ProtokollService";
import { createEintrag } from "../../src/services/EintragService";
import { dateToString } from "../../src/services/ServiceHelper";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";

let idBehrens: string
let idProtokoll: string
let idHassan: string
beforeEach(async () => {
    // create a pfleger
    const behrens = await pfleger.createPfleger({ name: "Hofrat Behrens", password: "geheim1234ASDF!§", admin: true })
    idBehrens = behrens.id!;
    const protokoll = await createProtokoll({ patient: "H. Castorp", datum: `01.11.1912`, ersteller: idBehrens, public: true });
    idProtokoll = protokoll.id!;
    
   const hasso = await pfleger.createPfleger({name: "Hassan", password: "22", admin: true});
   idHassan = hasso.id!;
    await createProtokoll({ patient: "H. Castorp", datum: `01.11.1912`, ersteller: idBehrens, public: true });
    
})

test("/api/protokoll/:id/eintrage get, 5 Einträge", async () => {
    await performAuthentication("Hofrat Behrens",  "geheim1234ASDF!§");
    for (let i = 1; i <= 5; i++) {
        await createEintrag({ getraenk: "BHTee", menge: i * 10, protokoll: idProtokoll, ersteller: idBehrens })
    }
    const testee = supertestWithAuth(app);
    const response = await testee.get(`/api/protokoll/${idProtokoll}/eintraege`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(5);
});

test("/api/protokoll/:id/eintrage get, keine Einträge", async () => {
    await performAuthentication("Hofrat Behrens",  "geheim1234ASDF!§");
    const testee = supertestWithAuth(app);
    const response = await testee.get(`/api/protokoll/${idProtokoll}/eintraege`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(0);
});

test("/api/protokoll/:id/eintrage get, falsche Protokoll-ID", async () => {
    await performAuthentication("Hofrat Behrens",  "geheim1234ASDF!§");
    const testee = supertestWithAuth(app);
    const response = await testee.get(`/api/protokoll/${idBehrens}/eintraege`);
    expect(response.statusCode).toBe(404);
});

test("post Protokoll as Admin", async () => {
    let pro = {
        patient: "Hassa",
        datum: new Date(),
        ersteller: idBehrens,
    }

    await performAuthentication("Hofrat Behrens",  "geheim1234ASDF!§");
    const testee = await supertestWithAuth(app).post(`/api/protokoll/`).send(pro);
    expect(testee.statusCode).toBe(201);

    expect(testee.body.patient).toBe("Hassa");

    let pro2 = {
        patient: "Hassa",
        datum: dateToString(new Date()),
        ersteller: '507f1f77bcf86cd799439011',
    }

    const testee2 = await supertestWithAuth(app).post(`/api/protokoll/`).send(pro2);
    expect(testee2.statusCode).toBe(400);//eigentlich 404 gewesen

    let pro3 = {
        patient: 22,
        datum: dateToString(new Date()),
        ersteller: '507f1f77bcf86cd799439011',
    }

    const testee3 = await supertestWithAuth(app).post(`/api/protokoll/`).send(pro3);
    expect(testee3).toHaveValidationErrorsExactly({ status: "400", body: "patient"});;
})

test("get Protokoll as Admin", async () => {
    await performAuthentication("Hofrat Behrens",  "geheim1234ASDF!§");

    const testee = await supertestWithAuth(app).get(`/api/protokoll/alle`);
    expect(testee.statusCode).toBe(200);
    expect(testee.body.length).toBe(2);

    const testee2 = await supertestWithAuth(app).get(`/api/protokoll/2222/eintraege`);
    expect(testee2).toHaveValidationErrorsExactly({ status: "400", params: "id"});
})

test("get Protokoll as Admin", async () => {
    let fakeID = '507f1f77bcf86cd799439011';
    await performAuthentication("Hofrat Behrens",  "geheim1234ASDF!§");
    const testee = await supertestWithAuth(app).get(`/api/protokoll/${idProtokoll}`);
    expect(testee.statusCode).toBe(200);
    expect(testee.body.patient).toBe("H. Castorp");

    const testee2 = await supertestWithAuth(app).get(`/api/protokoll/${fakeID}`);
    expect(testee2.statusCode).toBe(400);
})

test("put Protokoll as Admin", async () => {
    await performAuthentication("Hofrat Behrens",  "geheim1234ASDF!§");

    let fakeID = '507f1f77bcf86cd799439011';
    let pro2 = {
        id: idProtokoll,
        patient: "Hassa",
        datum: new Date(),
        ersteller: '507f1f77bcf86cd799439011',
    }

    let pro5 = {
        id: fakeID,
        patient: "Hüseyin",
        datum: new Date(),
        ersteller: idBehrens,
    }

    const testee = await supertestWithAuth(app).put(`/api/protokoll/${idBehrens}`).send(pro2);
    expect(testee.statusCode).toBe(400);

    const testee4 = await supertestWithAuth(app).put(`/api/protokoll/${pro2.id}`).send(pro5);
    expect(testee4.statusCode).toBe(400);


    let pro3 = {
        id: idProtokoll,
        patient: "Hüseyin",
        datum: dateToString(new Date("2011-2-5Z")),
        ersteller: idBehrens
        
    }
    const testee2 = await supertestWithAuth(app).put(`/api/protokoll/${idProtokoll}`).send(pro3);
    expect(testee2.statusCode).toBe(200);
    expect(testee2.body.patient).toBe("Hüseyin");

    let pro4 = {
        id: fakeID,
        patient: "Hüseyin",
        datum: new Date(),
        ersteller: idBehrens,
    }
    const testee3 = await supertestWithAuth(app).put(`/api/protokoll/${fakeID}`).send(pro4);
    expect(testee3.statusCode).toBe(400);

    let pro6 = {
        id: "222",
        patient: "Hüseyin",
        datum: new Date(),
        ersteller: idBehrens,
    }
    const testee5 = await supertestWithAuth(app).put(`/api/protokoll/${fakeID}`).send(pro6);
    expect(testee5).toHaveValidationErrorsExactly({ status: "400", body: "id"});
})

test("delete protokoll", async () => {
    let fakeID = '507f1f77bcf86cd799439011';
    await performAuthentication("Hofrat Behrens",  "geheim1234ASDF!§");

    const testee = await supertestWithAuth(app).delete(`/api/protokoll/${idProtokoll}`);
    expect(testee.statusCode).toBe(204);


    const testee2 =  await supertestWithAuth(app).delete(`/api/protokoll/${idProtokoll}`);
    expect(testee2.statusCode).toBe(400);

    const testee3 =  await supertestWithAuth(app).delete(`/api/protokoll/${fakeID}`);
    expect(testee3.statusCode).toBe(400);

    const testee4 =  await supertestWithAuth(app).delete(`/api/protokoll/232141`);
    expect(testee4).toHaveValidationErrorsExactly({ status: "400", params: "id"});
})

test("get 200, private and pflegerId", async () => {

    await performAuthentication("Hofrat Behrens",  "geheim1234ASDF!§");

   let a = await createProtokoll({ patient: "H. Castorp", datum: `01.11.1912`, ersteller: idBehrens, public: false });

   const testee = await supertestWithAuth(app).get(`/api/protokoll/${a.id}`);
   expect(testee.statusCode).toBe(200);
})

test("put 403, creatore and pfleger not the same", async () => {

    await performAuthentication("Hofrat Behrens",  "geheim1234ASDF!§");

   
    let b = await createProtokoll({ patient: "H. Castorp", datum: `01.11.1912`, ersteller: idHassan, public: false });
    let a = { id: b.id ,patient: "H. Castorp", datum: `01.11.1912`, ersteller: idHassan, public: false };
    const testee = await supertestWithAuth(app).put(`/api/protokoll/${b.id}`).send(a);
    expect(testee.statusCode).toBe(403);
})

test("delete 403, Creator and plfeger are different", async () => {

    await performAuthentication("Hofrat Behrens",  "geheim1234ASDF!§");

    let b = await createProtokoll({ patient: "H. Castorp", datum: `01.11.1912`, ersteller: idHassan, public: false });
    const testee = await supertestWithAuth(app).delete(`/api/protokoll/${b.id}`);
    expect(testee.statusCode).toBe(403);
})