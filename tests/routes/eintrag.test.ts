import dotenv from "dotenv";
dotenv.config();

import "restmatcher";
import supertest from "supertest";
import app from "../../src/app";
import * as eintrag from  "../../src/services/EintragService";
import * as pfleger from  "../../src/services/PflegerService";
import { createProtokoll } from "../../src/services/ProtokollService";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";


let idBehrens: string;
let idHassan: string;
let eintragHassan: any;
let protokoll: any;
beforeEach(async () => {
    // create a pfleger
    const behrens = await pfleger.createPfleger({ name: "Hofrat Behrens", password: "geheim1234ASDF!§", admin: false })
    idBehrens = behrens.id!;

   const hasso = await pfleger.createPfleger({name: "Hassan", password: "sadS22As!23", admin: true});
   idHassan = hasso.id!;

    protokoll = await createProtokoll({patient: "Levent" , datum: "2011-2-5Z", public: true, ersteller: idBehrens});
    eintragHassan = await eintrag.createEintrag({getraenk: "Cola", menge: 2, kommentar: "Test", ersteller: idHassan, protokoll: protokoll.id!})
    await pfleger.createPfleger({ name: "Bens", password: "geheim1234ASDF!§", admin: false })
})

test("post create", async () => {
   
    let ein = {
        getraenk: "coke",
        menge: 1,
        kommentar: "Mongoose",
        ersteller: idBehrens, 
        protokoll: protokoll.id!
    }
    await performAuthentication("Hofrat Behrens", "geheim1234ASDF!§");
    const testee = await supertestWithAuth(app).post(`/api/eintrag/`).send(ein);
    expect(testee.statusCode).toBe(201);
    expect(testee.body.getraenk).toBe("coke");
    expect(testee.body.menge).toBe(1);
    expect(testee.body.kommentar).toBe("Mongoose");
    expect(testee.body.ersteller).toBe(idBehrens);
    expect(testee.body.protokoll).toBe(protokoll.id);
    expect(testee.body.erstellerName).toBe("Hofrat Behrens");
    let protokoll2 = await createProtokoll({patient: "Levent" , datum: "2011-2-5Z", public: false, ersteller: idHassan});
    let ein2 = {
        getraenk: "222",
        menge: 22,
        kommentar: "22",
        ersteller: '507f1f77bcf86cd799439011', 
        protokoll: protokoll2.id!
    }

    const testee2 = await supertestWithAuth(app).post(`/api/eintrag/`).send(ein2);
    expect(testee2.statusCode).toBe(403);

    
    let ein3 = {

        menge:" 22",
        kommentar: "22",
        ersteller: idBehrens, 
        protokoll: protokoll.id!
    }
    

    const testee3 = await supertestWithAuth(app).post(`/api/eintrag/`).send(ein3);
    expect(testee3.statusCode).toBe(400);

})


test("put Eintrag", async () => {

    let ein = {
        id: eintragHassan.id,
        getraenk: "Fanta",
        menge: 3,
        kommentar: "Mongoose2",
        protokoll: protokoll.id,
        ersteller: idHassan
    }
    await performAuthentication("Hassan", "sadS22As!23");
    const testee = await supertestWithAuth(app).put(`/api/eintrag/${eintragHassan.id}`).send(ein);
    expect(testee.statusCode).toBe(200);
    expect(testee.body.getraenk).toBe("Fanta");
    expect(testee.body.menge).toBe(3);
    expect(testee.body.kommentar).toBe("Mongoose2");

    let fakeID = '507f1f77bcf86cd799439011';
    let ein3 = {
        id: '507f1f77bcf86cd799439011',
        getraenk: "Fanta",
        menge: 3,
        kommentar: "Mongoose2",
        protokoll: protokoll.id,
        ersteller: idHassan
    }
    await performAuthentication("Hassan", "sadS22As!23");
    const testee2 =  await supertestWithAuth(app).put(`/api/eintrag/${ein.id}`).send(ein3);
    expect(testee2.statusCode).toBe(400);

    let ein2 = {
        id: '507f1f77bcf86cd799439011',
        getraenk: "22",
        menge: 3,
        kommentar: "23",
        protokoll: '507f1f77bcf86cd799439011',
        ersteller: idHassan
    }
    let fakeId = '507f1f77bcf86cd799439011';
    await performAuthentication("Hassan", "sadS22As!23");
    const testee3 = await supertestWithAuth(app).put(`/api/eintrag/${fakeId}`).send(ein2);
    expect(testee3.statusCode).toBe(400);

    let ein4 = {
        id: idHassan,
        getraenk: "22",
        menge:"2A",
        kommentar: "23",
        protokoll: '507f1f77bcf86cd799439011',
        ersteller:idHassan
    }
    await performAuthentication("Hassan", "sadS22As!23");
    const testee4 = await supertestWithAuth(app).put(`/api/eintrag/${ein4.id}`).send(ein4);
    expect(testee4).toHaveValidationErrorsExactly({status: 400, body: "menge"});

})


test("get Eintrag", async () => {
    await performAuthentication("Hassan", "sadS22As!23");
    const testee = await supertestWithAuth(app).get(`/api/eintrag/${eintragHassan.id}`);
    expect(testee.statusCode).toBe(200);
    expect(testee.body.erstellerName).toBe("Hassan");
    expect(testee.body.protokoll).toBe(protokoll.id);

    let fakeId = '507f1f77bcf86cd799439011';    
    const testee2 = await supertestWithAuth(app).get(`/api/eintrag/${fakeId}`);
    expect(testee2.statusCode).toBe(400);

    const testee3 = await supertestWithAuth(app).get(`/api/eintrag/123`);
    expect(testee3).toHaveValidationErrorsExactly({status: 400, params: "id"});
})


test("delete Eintrag", async () =>{
    await performAuthentication("Hassan", "sadS22As!23");
    const testee = await supertestWithAuth(app).delete(`/api/eintrag/${eintragHassan.id}`); 
    expect(testee.statusCode).toBe(204);

    let fakeId = '507f1f77bcf86cd799439011';
    const testee2 = await supertest(app).delete(`/api/eintrag/${fakeId}`);
    expect(testee2.statusCode).toBe(401);

    const testee3 = await supertestWithAuth(app).delete(`/api/eintrag/23332`);
    expect(testee3).toHaveValidationErrorsExactly({status: 400, params: "id"});

    const testee4 = await supertestWithAuth(app).delete(`/api/eintrag/${fakeId}`);
    expect(testee4.statusCode).toBe(400);
})

test("delete Eintrag Protokoll ersteller löscht Eintrag", async () =>{
    await performAuthentication("Hofrat Behrens", "geheim1234ASDF!§");

    const testee = await supertestWithAuth(app).delete(`/api/eintrag/${eintragHassan.id}`); 
    expect(testee.statusCode).toBe(204);

})

test("delete Eintrag Einträger löscht", async () =>{
    await performAuthentication("Hassan", "sadS22As!23");

    const testee = await supertestWithAuth(app).delete(`/api/eintrag/${eintragHassan.id}`); 
    expect(testee.statusCode).toBe(204);
})

test("Eintrag post, 403", async () => {
    await performAuthentication("Bens", "geheim1234ASDF!§");
    let pro = await createProtokoll({patient: "Levent" , datum: "2011-2-5Z", public: false, ersteller: idBehrens});
    let ein = {
        getraenk: "Cola", 
        menge: 2, 
        kommentar: "Test", 
        ersteller: idHassan, 
        protokoll: pro.id!
    }
    const testee = await supertestWithAuth(app).post(`/api/eintrag/`).send(ein); 
    expect(testee.statusCode).toBe(403);
})

test("Eintrag get, 403", async () => {

    await performAuthentication("Bens", "geheim1234ASDF!§");
    let pro = await createProtokoll({patient: "Levent" , datum: "2011-2-5Z", public: false, ersteller: idBehrens});
    let ein = await eintrag.createEintrag ({
        getraenk: "Cola", 
        menge: 2, 
        kommentar: "Test", 
        ersteller: idHassan, 
        protokoll: pro.id!
    });
    const testee = await supertestWithAuth(app).get(`/api/eintrag/${ein.id}`).send(ein); 
    expect(testee.statusCode).toBe(403);
})


test("Eintrag get, 200", async () => {

    await performAuthentication("Hassan", "sadS22As!23");
    let pro = await createProtokoll({patient: "Levent" , datum: "2011-2-5Z", public: false, ersteller: idBehrens});
    let ein = await eintrag.createEintrag ({
        getraenk: "Cola", 
        menge: 2, 
        kommentar: "Test", 
        ersteller: idHassan, 
        protokoll: pro.id!
    });
    const testee = await supertestWithAuth(app).get(`/api/eintrag/${ein.id}`).send(ein); 
    expect(testee.statusCode).toBe(200);
})


test("Eintrag put, 403", async () => {

    await performAuthentication("Bens", "geheim1234ASDF!§");
    let pro = await createProtokoll({patient: "Levent" , datum: "2011-2-5Z", public: false, ersteller: idBehrens});
    let ein = await eintrag.createEintrag({
        getraenk: "Cola", 
        menge: 2, 
        kommentar: "Test", 
        ersteller: idHassan, 
        protokoll: pro.id!
    });
    const testee = await supertestWithAuth(app).put(`/api/eintrag/${ein.id}`).send(ein); 
    expect(testee.statusCode).toBe(403);
})


test("Eintrag delete, 403", async () => {
    await performAuthentication("Bens", "geheim1234ASDF!§");
    let pro = await createProtokoll({patient: "Levent" , datum: "2011-2-5Z", public: false, ersteller: idBehrens});
    let ein = await eintrag.createEintrag({
        getraenk: "Cola", 
        menge: 2, 
        kommentar: "Test", 
        ersteller: idHassan, 
        protokoll: pro.id!
    });
    const testee = await supertestWithAuth(app).delete(`/api/eintrag/${ein.id}`); 
    expect(testee.statusCode).toBe(403);
})