import dotenv from "dotenv";
dotenv.config();

import "restmatcher";
import supertest from "supertest";
import app from "../../src/app";
import * as pfleger from  "../../src/services/PflegerService";
import { Types } from "mongoose";
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";

let idBehrens: string;
let idHassan: string;
beforeEach(async () => {
    // create a pfleger
    const behrens = await pfleger.createPfleger({ name: "Hofrat Behrens", password: "geheim1234ASDF!§", admin: true })
    idBehrens = behrens.id!;

   const hasso = await pfleger.createPfleger({name: "Hassan", password: "22", admin: true});
   idHassan = hasso.id!;

   await pfleger.createPfleger({name: "ErayKaan", password: "geheim1234ASDF!§", admin: false});
})

test("get alle Pfleger, to Be 3", async () => {
    await performAuthentication("Hofrat Behrens", "geheim1234ASDF!§");
    const testee = supertestWithAuth(app);
    const response = await testee.get(`/api/pfleger/alle`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(3);
})

test("post create Pfleger as Admin" , async () => {
    await performAuthentication("Hofrat Behrens", "geheim1234ASDF!§");
    let pf = {
        name: "Eray",
        password: "aS2!24sfSFW",
        admin: false
    }
    const testee = await supertestWithAuth(app).post(`/api/pfleger/`).send(pf);
    expect(testee.statusCode).toBe(201);
    expect(testee.body).not.toHaveProperty("password");
    expect(testee.body.name).toBe("Eray");
    expect(testee.body.admin).toBeFalsy();
    expect(testee.body.password).toBeUndefined()

    const testee2 = await  supertestWithAuth(app).post(`/api/pfleger/`).send("");
    expect(testee2.statusCode).toBe(400);

    let pf2= {
        name: "Eray",
        password: "aS2!24sfSFW",
        admin: false
    }

    const testee3 = await  supertestWithAuth(app).post(`/api/pfleger/`).send(pf2);
    expect(testee3.statusCode).toBe(400);

})

test("put Pfleger as Admin", async () =>{
    let pf = {
        id: idBehrens,
        name: "Eray",
        password: "aS2!24sfSFW23",
        admin: false
    }
    await performAuthentication("Hofrat Behrens", "geheim1234ASDF!§");
    const testee = await  supertestWithAuth(app).put(`/api/pfleger/${idBehrens}`).send(pf);
    expect(testee.statusCode).toBe(200);
    expect(testee.body.name).toBe("Eray");
    expect(testee.body.admin).toBeFalsy();
    expect(testee.body.password).not.toBeDefined();

    let pf2 = {
        id: '507f1f77bcf86cd799439012',
        name: "Eray", 
        password: "aS2!24sfSFW23",
        admin: false
    }
    const testee2 =  await  supertestWithAuth(app).put(`/api/pfleger/${'507f1f77bcf86cd799439012'}`).send(pf2);
    expect(testee2.statusCode).toBe(400);

    let pfN = {
        id:  '507f1f77bcf86cd799439012',
        name: "22",
        password: "JFUW!skaf2",
        admin: false
    }
    const testee3 =  await  supertestWithAuth(app).put(`/api/pfleger/${idHassan}`).send(pfN);
    expect(testee3).toHaveValidationErrorsExactly({ status: "400", params: "id", body: "id"});

    let pfN2 = {
        id:  '507f1f77bcf86cd799439012',
        name: 22,
        password: "JFUW!skaf2",
        admin: false
    }

    const testee4 =  await  supertestWithAuth(app).put(`/api/pfleger/${idHassan}`).send(pfN2);
    expect(testee4).toHaveValidationErrorsExactly({ status: "400", body: "name"});
})



test("delete Pfleger as Admin", async () =>{
    await performAuthentication("Hofrat Behrens", "geheim1234ASDF!§");
    const testee = await supertestWithAuth(app).delete(`/api/pfleger/${idHassan}`);
    expect(testee.statusCode).toBe(204);

    const testee2 = await supertestWithAuth(app).delete(`/api/pfleger/20214214512421561`);
    expect(testee2.statusCode).toBe(400);

    await supertest(app).delete(`/api/pfleger/${idHassan}`);

    const testee3 = await supertestWithAuth(app).delete(`/api/pfleger/507f1f77bcf86cd799439011`);
    expect(testee3.statusCode).toBe(400);
})

test("get as User", async () => {
    await performAuthentication("Eray", "geheim1234ASDF!§");

    const testee = await supertestWithAuth(app).get(`/api/pfleger/alle`);
    expect(testee.statusCode).toBe(401);

})

test("post as User", async () => {
    await performAuthentication("ErayKaan", "geheim1234ASDF!§");
    let pfe = {
        name: "Levonion",
        password: "geheim1234ASDF!§",
    }
    const testee = await supertestWithAuth(app).post(`/api/pfleger/`).send(pfe);
    expect(testee.statusCode).toBe(401);
})

test("put as User", async () => {
    await performAuthentication("ErayKaan", "geheim1234ASDF!§");
    let pfe = {
        id: idBehrens,
        name: "Levonion",
        password: "geheim1234ASDF!§",
        admin: false
    }
    const testee = await supertestWithAuth(app).put(`/api/pfleger/${idBehrens}`).send(pfe);
    expect(testee.statusCode).toBe(401);
})

test(("delete as User"), async () => {
    await performAuthentication("ErayKaan", "geheim1234ASDF!§");
  
    const testee = await supertestWithAuth(app).delete(`/api/pfleger/${idBehrens}`);
    expect(testee.statusCode).toBe(401);
})

test(("delete yoruself as Admin"), async () => {
    await performAuthentication("Hofrat Behrens", "geheim1234ASDF!§");
  
    const testee = await supertestWithAuth(app).delete(`/api/pfleger/${idBehrens}`);
    expect(testee.statusCode).toBe(403);
})