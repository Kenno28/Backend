import dotenv from "dotenv";
dotenv.config();
import { verifyPasswordAndCreateJWT, verifyJWT} from "../src/services/JWTService";
import * as pfleger from "../src/services/PflegerService"
import { JsonWebTokenError } from "jsonwebtoken";

let idBehrens;
let idHassan;
beforeEach(async () => {
    // create a pfleger
    const behrens = await pfleger.createPfleger({ name: "Hofrat Behrens", password: "geheim1234ASDF!§", admin: true })
    idBehrens = behrens.id!;

   const hasso = await pfleger.createPfleger({name: "Hassan", password: "22", admin: true});
   idHassan = hasso.id!;
})


test("verify Password and Create JWT", async () =>{

   const Soe = await verifyPasswordAndCreateJWT("Hofrat Behrens", "geheim1234ASDF!§");

   expect(Soe).toHaveProperty("sub");
})


test("verify JWT, empty String", () =>{

    expect(() => verifyJWT("")).toThrow("String is not defined");
})

test("verify JWT, fake String", () =>{
    expect(() => verifyJWT("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkZha2UgVXNlciIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c")).toThrow(JsonWebTokenError);
})
 
