import supertest from "supertest";
import { verifyPasswordAndCreateJWT, verifyJWT} from "../src/services/JWTService";
import app from "../src/app";



test("verify Password and Create JWT, but secret is udnefined", async () =>{

    await expect(verifyPasswordAndCreateJWT("sadasfa","awefafas!")).rejects.toThrow("Secret is Undefined")
})

test("verify JWT, but secret is undefined", () =>{

  expect(()=>verifyJWT("213123")).toThrow("Secret or TTL is Undefined");
})

test("login post, 404", async () => {
  let data = {
      name:"Hofrat renss",
      password: "geheim1234ASDF!§"
  }
  let log = await supertest(app).post(`/api/login/`).send(data);

  expect(log.statusCode).toBe(400);
})