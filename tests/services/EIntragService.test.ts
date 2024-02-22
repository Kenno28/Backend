import {createPfleger, deletePfleger, getAllePfleger, updatePfleger} from "../../src/services/PflegerService";
import { EintragResource, PflegerResource, ProtokollResource } from "../../src/Resources";
import { IPfleger, Pfleger } from "../../src/model/PflegerModel";
import { createEintrag, deleteEintrag, getAlleEintraege, getEintrag, updateEintrag } from "../../src/services/EintragService";
import { Eintrag } from "../../src/model/EintragModel";
import { IProtokoll, Protokoll } from "../../src/model/ProtokollModel";
import { dateToString } from "../../src/services/ServiceHelper";

let protkoll: any;
let pflegerEray: PflegerResource;
let ein: EintragResource;
let ein4: EintragResource;
beforeEach(async () => {
let Pflege = new Pfleger ({name: "Eray", password: "123", admin: true});
pflegerEray = await createPfleger(Pflege as PflegerResource);

protkoll = await Protokoll.create({patient: "Levent" , datum: new Date("2011-2-5Z"), public: true, ersteller: pflegerEray.id})
let eins = await Eintrag.create({getraenk: "Cola", menge: 2, ersteller: pflegerEray.id, protokoll: protkoll.id});

let eins2 = {
    getraenk: eins.getraenk,
    menge: eins.menge,
    kommentar: eins.kommentar,
    ersteller: pflegerEray.id!.toString(),
    erstellerName: pflegerEray.name,
    protokoll: protkoll.id!.toString(),
    createdAt: dateToString(eins.createdAt)
}

ein = await createEintrag(eins2);

let eins3 = {
    getraenk: eins.getraenk,
    menge: eins.menge,
    kommentar: eins.kommentar,
    ersteller: pflegerEray.id!.toString(),
    erstellerName: "Levent",
    protokoll: protkoll.id!.toString(),
    createdAt: dateToString(eins.createdAt)
}

ein4 = await createEintrag(eins3);


let Pflege2 = new Pfleger ({name: "Levent", password: "123", admin: true});
let pflegerLevent = await createPfleger(Pflege2 as PflegerResource);
let protkoll2 = await Protokoll.create({patient: "Levent" , datum: new Date("2011-2-5Z"), public: true, ersteller: pflegerEray.id})

let eins5 = {
    getraenk: eins.getraenk,
    menge: eins.menge,
    kommentar: eins.kommentar,
    ersteller: pflegerLevent.id!.toString(),
    erstellerName: pflegerLevent.name,
    protokoll: protkoll2.id!.toString(),
    createdAt: dateToString(eins.createdAt)
}
await createEintrag(eins5);
})

test("getEintrag alles kommt zurück", async () =>{
    const lef = await getEintrag(ein.id!.toString());

    expect(lef.getraenk).toBe("Cola");
    expect(lef.menge).toBe(2);
    expect(lef.kommentar).toBeUndefined();
    expect(lef.erstellerName).toBe("Eray");
    expect(lef.ersteller).toBe(pflegerEray.id!.toString());
    expect(lef.createdAt).toBe(dateToString(new Date()));
    expect(lef.protokoll).toBe(protkoll.id);
});

test("getEintrag fehler", async () =>{
 await expect(getEintrag('507f1f77bcf86cd799439011')).rejects.toThrow("Eintrag does not Exist");
 await expect(getEintrag('')).rejects.toThrow("no valid Id");
 let fakeEintrag = await Eintrag.create({getraenk: "Cola", menge: 2, ersteller: '507f1f77bcf86cd799439011', protokoll: protkoll.id});
 await expect(getEintrag(fakeEintrag.id)).rejects.toThrow("Pfleger does not Exist");
 let fakeEintrag2 = await Eintrag.create({getraenk: "Cola", menge: 2, ersteller: pflegerEray.id, protokoll: '507f1f77bcf86cd799439011'});
 await expect(getEintrag(fakeEintrag2.id)).rejects.toThrow("Protokoll does not Exist");
});

test("createEintrag fehler", async () => {
    let fakeEin= {
        getraenk: "fanta",
        menge: 2,
        kommentar: "asdaf",
        ersteller: '507f1f77bcf86cd799439011',
        erstellerName: "Hasssssan",
        protokoll: '507f1f77bcf86cd799439011'
    }

   await expect( createEintrag(fakeEin)).rejects.toThrow(`No pfleger found with id ${fakeEin.ersteller}`)

    let fakeEin2= {
        getraenk: "fanta",
        menge: 2,
        kommentar: "asdaf",
        ersteller: pflegerEray.id!.toString(),
        erstellerName: "Hasssssan",
        protokoll: '507f1f77bcf86cd799439011'
    }

   await expect( createEintrag(fakeEin2)).rejects.toThrow(`No protokoll found with id ${fakeEin2.protokoll}`);
    let fakeProtokoll = await Protokoll.create({patient: "Levent" , datum: new Date("2011-2-5Z"), public: true, closed: true, ersteller: pflegerEray.id})
   let fakeEin3= {
    getraenk: "fanta",
    menge: 2,
    kommentar: "asdaf",
    ersteller: pflegerEray.id!.toString(),
    erstellerName: "Hasssssan",
    protokoll: fakeProtokoll.id
    }

    await expect( createEintrag(fakeEin3)).rejects.toThrow(`Protokoll ${fakeEin3.protokoll} is already closed`);
})

test("getAlleEintreage", async () =>{
    const ein = await getAlleEintraege(protkoll.id);

    expect(ein.length).toBe(3);
    expect(ein[0].erstellerName).toBe("Eray");
    expect(ein[2].erstellerName).toBe("Eray");
})

test("getAlleEintreage fehler", async () =>{
    let fakeProtokoll =  await Protokoll.create({ersteller:'507f1f77bcf86cd799439011' , datum: new Date("2021-12-1Z"), patient: "Sttufff"});
    await expect(getAlleEintraege('507f1f77bcf86cd799439011')).rejects.toThrow("Protokoll does not Exist");
    await expect(getAlleEintraege(fakeProtokoll.id)).rejects.toThrow("Pfleger does not Exist");
})

test("updateEintrag", async () => {

    let Ein = {
        id: ein.id!.toString(),
        getraenk: "sprite",
        menge:3,
        kommentar: "AAAAA",
        ersteller: pflegerEray.id!.toString(),
        erstellerName: "Levent",
        protokoll: protkoll.id!.toString(),
        createdAt: dateToString(new Date())
    }

     await updateEintrag(Ein)

    const einNew = await getEintrag(Ein.id);

    expect(einNew).toBeDefined();
    expect(einNew.getraenk).toBe("sprite");
    expect(einNew.menge).toBe(3);
    expect(einNew.kommentar).toBe("AAAAA");
    expect(einNew.ersteller).toBe(pflegerEray.id!.toString());
    expect(einNew.erstellerName).toBe("Eray");
    expect(einNew.createdAt).toBe(dateToString(new Date()));
    expect(einNew.protokoll).toBe(protkoll.id!.toString());
})

test("updateEintrag fehler", async () => {

    await expect(updateEintrag(null!)).rejects.toThrow("is Null");

    let fakeEin = {
        getraenk: "fanta",
        menge:3,
        kommentar: "AAAAA",
        ersteller:'507f1f77bcf86cd799439011',
        erstellerName: "Levent",
        protokoll: protkoll.id!.toString(),
        createdAt: dateToString(new Date())
    }
    await expect(updateEintrag(fakeEin as EintragResource)).rejects.toThrow("Eintrag nicht gefunden");

    // let eintrag = await Eintrag.create({getraenk: "AS", menge:2, ersteller: pflegerEray.id, protokoll: protkoll.id});
    // let fakEEin =  {
    //     id: eintrag.id,
    //     getraenk: "fanta",
    //     menge:3,
    //     kommentar: "AAAAA",
    //     ersteller:'507f1f77bcf86cd799439011',
    //     erstellerName: "Levent",
    //     protokoll: protkoll.id!.toString(),
    //     createdAt: dateToString(new Date())
    // };

    // await expect(updateEintrag(fakEEin)).rejects.toThrow("Pfleger does not Exist");

    // let fakEEin2 =  {
    //     id: eintrag.id,
    //     getraenk: "fanta",
    //     menge:3,
    //     kommentar: "AAAAA",
    //     ersteller: pflegerEray.id!.toString(),
    //     erstellerName: "Levent",
    //     protokoll: '507f1f77bcf86cd799439011',
    //     createdAt: dateToString(new Date())
    // };

    // await expect(updateEintrag(fakEEin2)).rejects.toThrow("Protocol does not Exist");
})

test("delete Eintrag fehler", async () => {
    await expect(deleteEintrag("")).rejects.toThrow("No id given");
    await expect(deleteEintrag('507f1f77bcf86cd799439011')).rejects.toThrow("Eintrag not deleted");
})

test("delete testen", async () => {

    await deleteEintrag(ein.id!.toString());

    await expect(getEintrag(ein.id!.toString())).rejects.toThrow("Eintrag does not Exist");
})
