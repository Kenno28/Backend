import dotenv from "dotenv";
dotenv.config();

import "restmatcher";
import supertest from "supertest";
import app from "../../src/app";
import * as pfleger from "../../src/services/PflegerService"
import { performAuthentication, supertestWithAuth } from "../supertestWithAuth";

let idHassan;
let idBehrens: any;
beforeEach(async () => {
    // create a pfleger
    const behrens = await pfleger.createPfleger({ name: "Hofrat Behrens", password: "geheim1234ASDF!§", admin: false })
    idBehrens = behrens.id!;

   const hasso = await pfleger.createPfleger({name: "Hassan", password: "sadS22As!23", admin: true});
   idHassan = hasso.id!;

})


test("login post, validation Error", async () => {
    let data = {
        name:22,
        password: "geheim1234ASDF!§"
    }
    let log = await supertest(app).post(`/api/login/`).send(data);

    expect(log.statusCode).toBe(400);
})

test("login post, undefined", async () => {
    let data = {
        name:"asdsad",
        password: "geheim1234ASDF!§"
    }
    let log = await supertest(app).post(`/api/login/`).send(data);

    expect(log.body.jwtString).toBeUndefined();
})

test("login post, 200", async () => {
    let data = {
        name:"Hofrat Behrens",
        password: "geheim1234ASDF!§"
    }
    let log = await supertest(app).post(`/api/login/`).send(data);

    expect(log.statusCode).toBe(201);
})


test("login get, 404", async () => {

    let log = await supertest(app).get(`/api/login/`);
    expect(log.statusCode).toBe(400);
    expect(log.body).toBe(false);
})

test("login get, 200", async () => {
    await performAuthentication("Hofrat Behrens", "geheim1234ASDF!§");

    let log =  await supertestWithAuth(app).get(`/api/login/`);

    expect(log.statusCode).toBe(200);
    expect(log.body.id).toBe(idBehrens);
    expect(log.body.role).toBe("u");
})

test("login delete, 204", async () => {
    await performAuthentication("Hofrat Behrens", "geheim1234ASDF!§");
    let log = await supertestWithAuth(app).delete(`/api/login/`);
     expect(log.statusCode).toBe(204);
})
