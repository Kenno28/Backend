import { PflegerResource } from "../../src/Resources";
import { Pfleger } from "../../src/model/PflegerModel";
import { login } from "../../src/services/AuthenticationService";
import { createPfleger } from "../../src/services/PflegerService";



let pflegerLevent: PflegerResource;
let pflegerAhmad: PflegerResource;
let lev: PflegerResource;
let ah: PflegerResource;
beforeEach(async () => {
   lev = new Pfleger({name: "Levent", password: "223", admin: false}) as PflegerResource;
    ah = new Pfleger({name: "ahmad", password: "2213", admin: true}) as PflegerResource;
  
    pflegerLevent = await createPfleger(lev);
    pflegerAhmad = await createPfleger(ah);
})

test("login", async () =>{

    expect(await login("Levent", "223")).toEqual({
        id: pflegerLevent.id,
        role: "u"
    });

    expect(await login("ahmad", "2213")).toEqual({
        id: pflegerAhmad.id,
        role: "a"
    })

    expect(await login("Levent", "asd")).toBeFalsy();

    expect(await login("", "null")).toBeFalsy()
})