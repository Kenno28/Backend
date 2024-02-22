import { HydratedDocument } from "mongoose";
import { IPfleger, Pfleger } from "../../src/model/PflegerModel";
import { Eintrag, IEintrag } from "../../src/model/EintragModel";
import { IProtokoll, Protokoll } from "../../src/model/ProtokollModel";


let pfleger: HydratedDocument<IPfleger>;
let protokoll: HydratedDocument<IProtokoll>;
let eintrag: HydratedDocument<IEintrag>;
beforeEach(async () => {
    pfleger = await Pfleger.create({name: "Hal", password: "222" });
    protokoll= await Protokoll.create({patient: "Halunke", datum: new Date(500000000000), ersteller: pfleger.id})
    eintrag = await Eintrag.create({getraenk: "Fanta", menge: 1, ersteller: pfleger.id, protokoll: protokoll.id})
})

test("Testen Eintrag Basics", async () => {
    const MeinEintrag = new Eintrag({getraenk: "cola", menge: 2, ersteller: pfleger.id, protokoll: protokoll.id});
    await MeinEintrag.save();
    

    const MeinGefundenerEintrag: HydratedDocument<IEintrag>[] = await Eintrag.find({getraenk: eintrag.getraenk}).exec();

  
    expect(MeinGefundenerEintrag[0].getraenk).toBe("Fanta");
    expect(MeinEintrag.getraenk).toBe("cola");
    expect(MeinEintrag.menge).toBe(2);
    expect(MeinEintrag.ersteller.toString()).toBe(pfleger.id.toString());
    expect(MeinEintrag.protokoll.toString()).toBe(protokoll.id.toString());
    
});
//Schema.typesof bei Schema
//typeof
test("Eintrag requierd Testen", async () => {
    
    expect(new Eintrag({getreank: "cola"})).toThrowError;
    expect(new Eintrag({})).toBeUndefined;
    expect(new Eintrag({})).toThrowError;
    expect(new Eintrag({menge: 1})).toThrowError;
    expect(new Eintrag({ersteller: pfleger.id})).toThrowError;
    expect(new Eintrag({protokoll: protokoll.id})).toThrowError;
})
