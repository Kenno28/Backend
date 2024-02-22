import { PflegerResource, ProtokollResource } from "../../src/Resources";
import { Eintrag } from "../../src/model/EintragModel";
import { Pfleger } from "../../src/model/PflegerModel";
import { Protokoll } from "../../src/model/ProtokollModel";
import { createPfleger} from "../../src/services/PflegerService";
import { createProtokoll, deleteProtokoll, getAlleProtokolle, getProtokoll, updateProtokoll } from "../../src/services/ProtokollService";
import { dateToString } from "../../src/services/ServiceHelper";

let pflegerDuc: PflegerResource;
let Duc: PflegerResource;
let protkoll1: ProtokollResource;
let protkoll2;
let protkoll3;
let protkoll4;
let protkoll5;
let protkoll6;

beforeEach(async () => {
    Duc = new Pfleger({name: "Duc", password: "Duc223", admin: false}) as PflegerResource;
    pflegerDuc = await createPfleger(Duc);

    let Duc2 = new Pfleger({name: "DucDa", password: "Duc223", admin: false}) as PflegerResource;
    let pflegerDuc2 = await createPfleger(Duc2);

    if(pflegerDuc.id){
    let pro = {
         patient: "Porf",
         datum: new Date("2021-9-1Z").toString(),
         public: false,
         closed: false,
         ersteller: pflegerDuc.id,
         erstellerName: pflegerDuc.name.toString(),
         gesamtMenge: 0
    }

    await Eintrag.create({getraenk: "cola", menge: 3, ersteller: pflegerDuc.id, protokoll:'507f1f77bcf86cd799439011'});
    await Eintrag.create({getraenk: "cola", menge: 3, ersteller: '507f1f77bcf86cd799439012', protokoll:'507f1f77bcf86cd799439011'});
   protkoll1 = await createProtokoll(pro);
   protkoll2 = await Protokoll.create({ersteller: pflegerDuc.id, datum: new Date("2021-12-1Z"), patient: "Sttufff"});

   await Eintrag.create({getraenk: "cola", menge: 3, ersteller: pflegerDuc.id, protokoll: protkoll1.id});
   await Eintrag.create({getraenk: "cola", menge: 5, ersteller: pflegerDuc.id, protokoll: protkoll1.id});
   await Eintrag.create({getraenk: "cola", menge: 3, ersteller: pflegerDuc.id, protokoll: '507f1f77bcf86cd799439012'});

   protkoll3 = await Protokoll.create({ersteller: pflegerDuc.id, datum: new Date("2022-10-1Z"), patient: "Littt", public: true})
   await Eintrag.create({getraenk: "cola", menge: 3, ersteller: pflegerDuc.id, protokoll: protkoll3.id});
   protkoll4 = await Protokoll.create({ersteller: pflegerDuc2.id, datum: new Date("2023-11-1Z"), patient: "Hans", public: true})
  
    protkoll5 = await Protokoll.create({ersteller: '547f1f77bcf86cd799439011', datum: new Date("2023-10-1Z"), patient: "Lele", public:false })
    protkoll6 = await Protokoll.create({ersteller: '547f1f77bcf86cd799439011', datum: new Date("2023-10-1Z"), patient: "Lele", public:false })
   
   
        
 }
})

test("createProtokoll", async () => {
    let pro = {
        patient: "Litauen",
        datum: new Date("2011-2-5Z").toString(),
        public: false,
        closed: true,
        ersteller: pflegerDuc.id!.toString(),
        erstellerName: pflegerDuc.name.toString(), 
        gesamtMenge: 2
   }

   const createdProtokoll = await createProtokoll(pro);

   expect(createdProtokoll).toBeDefined();
   expect(createdProtokoll.patient).toBe("Litauen");
   expect(createdProtokoll.datum).toBe("05.02.2011");
   expect(createdProtokoll.public).toBeFalsy();
   expect(createdProtokoll.closed).toBeTruthy();
   expect(createdProtokoll.ersteller).toBe(pflegerDuc.id?.toString());

   let pro2 = {
    patient: "Litauen",
    datum: new Date("2011-2-5Z").toString(),
    public: false,
    closed: true,
    ersteller: '507f1f77bcf86cd799439011',
    erstellerName: pflegerDuc.name.toString(), 
    gesamtMenge: 2
    }

    await expect(createProtokoll(pro2)).rejects.toThrow("No Pfleger found");
})


test("getAlleProtokolle", async () => {

    const pro = await getAlleProtokolle(pflegerDuc.id!.toString());
    
    expect(pro.length).toBe(4); 
    
    const protkollAfter = pro[0];
    expect(protkollAfter.public).toBeFalsy();
    expect(protkollAfter.ersteller).toBe(pflegerDuc.id?.toString());
    expect(protkollAfter.gesamtMenge).toBe(11);
    
    const protokoll3after = pro[2];
    expect(protokoll3after.public).toBeTruthy();
    expect(protokoll3after.patient).toBe("Littt");

    const protokoll4after= pro[3];
    expect(protokoll4after.gesamtMenge).not.toBeUndefined();

    await expect(getAlleProtokolle('507f1f77bcf86cd799439012')).rejects.toThrow("no such Pfleger found");

    const pro2 = await getAlleProtokolle();

    expect(pro2.length).toBe(2);

    const protkollAfter2 = pro2[0];
    expect(protkollAfter2.gesamtMenge).toBe(0);
      
})

test("getProtokoll", async () =>{
    const pro = await getProtokoll(protkoll1.id?.toString()!);

    await expect(getProtokoll("")).rejects.toThrow("no Id given");

    await expect(getProtokoll( '507f1f77bcf86cd799439013')).rejects.toThrow("No protocol found");


    const a = await Protokoll.create({ersteller: '507f1f77bcf86cd799439016', datum: new Date("2023-11-1Z"), patient: "Hans", public: false});
    await expect(getProtokoll(a.id)).rejects.toThrow("no such Pfleger found");
    
    expect(pro.patient).toBe("Porf");
    expect(pro.datum).toBe("01.09.2021");
    expect(pro.public).toBeFalsy();
    expect(pro.closed).toBeFalsy();
    expect(pro.ersteller).toBe(pflegerDuc.id);
    expect(pro.erstellerName).toBe(pflegerDuc.name);
    expect(pro.gesamtMenge).toBe(8);
})

test("updateProtkoll", async () => {
    let pro = {
        patient: "Litauen",
        datum: new Date("2011-2-5Z").toString(),
        public: false,
        closed: true,
        ersteller:  pflegerDuc.id!.toString(),
        erstellerName: pflegerDuc.name.toString(),
        gesamtMenge: 2
    }
    let date = new Date()
    let date2 = dateToString(date);
    let pro2 = {
        patient: "Litauen",
        datum: date2,
        public: false,
        closed: true,
        ersteller: '507f1f77bcf86cd799439016',
        erstellerName:  pflegerDuc.name.toString(),
        gesamtMenge: 2
    }

    
    await expect(updateProtokoll(pro2)).rejects.toThrow("No protocol been found");

    const createdProtokoll = await createProtokoll(pro);
    
    let updatedpro = {
        id: createdProtokoll.id,
        patient: createdProtokoll.patient,
        datum: createdProtokoll.datum,
        public: true,
        closed: createdProtokoll.closed,
        ersteller: '807f1f77bcf86cd799439012',
        erstellerName: "Levent",
        gesamtMenge: 3
    }


    const updatedProtokoll = await updateProtokoll(updatedpro);

    expect(updatedProtokoll).toBeDefined();
    expect(updatedProtokoll.patient).toBe("Litauen");
    expect(updatedProtokoll.datum).toBe("05.02.2011");
    expect(updatedProtokoll.public).toBeTruthy();
    expect(updatedProtokoll.closed).toBeTruthy();
    expect(updatedProtokoll.ersteller).toBe('807f1f77bcf86cd799439012');
    expect(updatedProtokoll.erstellerName).toBe("Levent");
    expect(updatedProtokoll.gesamtMenge).toBe(3);
})

test("deleteProtokoll", async () => {

    expect(await deleteProtokoll(protkoll1.id!)).not.toBeDefined();

    await expect(deleteProtokoll("")).rejects.toThrow("No id given")

   await expect( deleteProtokoll('807f1f77bcf86cd799439012')).rejects.toThrow("Protocol not deleted");
   await expect( deleteProtokoll(protkoll1.id!)).rejects.toThrow("Protocol not deleted");
})

