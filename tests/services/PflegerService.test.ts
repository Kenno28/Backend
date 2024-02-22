import {createPfleger, deletePfleger, getAllePfleger, updatePfleger} from "../../src/services/PflegerService";
import { PflegerResource } from "../../src/Resources";
import { IPfleger, Pfleger } from "../../src/model/PflegerModel";


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

test("create & getAllePfleger", async () => {
    expect(pflegerLevent.name).toBeDefined();
    expect(pflegerLevent.admin).toBeDefined();
    expect(pflegerLevent.password).not.toBeDefined();

    let results = await getAllePfleger();
    expect(results).not.toHaveProperty("password");
    expect(results.length).toBeGreaterThan(1);
    expect(results.length).not.toBeGreaterThan(2);
})

test("change Password", async () => {
    let updatedAhmad = {
        id: pflegerAhmad.id,
        name: pflegerAhmad.name,
        password: "",
        admin: pflegerAhmad.admin
    }

    let updatedLevent = {
        id: pflegerLevent.id,
        password: "223",
        admin: pflegerLevent.admin
    }

    let falsePfleger = {
        id: '507f1f77bcf86cd799439011'
    }

    let updatedAhmad2 = {
        id: pflegerAhmad.id,
        name: "Sui",
        password: "22134",
        admin: false
    }


   
   await expect(updatePfleger(falsePfleger as PflegerResource)).rejects.toThrowError("No pfleger with id " + falsePfleger.id + " could not been found.");
   

   await updatePfleger(updatedAhmad2);

   const updatedPfleger = await Pfleger.findById(pflegerAhmad.id).exec();
  
   if(updatedPfleger){
   expect(updatedPfleger.name).toBe("Sui");
   expect(updatedPfleger.admin).toBeFalsy();
   expect(updatedPfleger.isCorrectPassword("22134")).toBeTruthy();
  }
})

test("deletePfleger", async () => {
   await expect(deletePfleger('507f1f77bcf86cd799439011')).rejects.toThrow("Pfleger not deleted");
   await expect(deletePfleger("")).rejects.toThrow("No id given");
   deletePfleger(pflegerAhmad.id!);
   await expect( deletePfleger(pflegerAhmad.id!)).rejects.toThrow("Pfleger not deleted");
})