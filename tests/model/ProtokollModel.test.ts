import { HydratedDocument} from "mongoose"; 
import { IProtokoll, Protokoll } from "../../src/model/ProtokollModel";  
import { IPfleger, Pfleger } from "../../src/model/PflegerModel";

let protokoll: HydratedDocument<IProtokoll>;
let DUC : HydratedDocument<IPfleger>;

beforeEach(async () => {
    DUC = new Pfleger({name: "Levent", password: "123"});
    protokoll = await Protokoll.create({patient: "Mustafa", datum: new Date(500000000000), ersteller: DUC.id});
});

test("Testen Protokoll Basics", async() => {

    const MyProtokoll = new Protokoll({patient: protokoll.patient, datum: protokoll.datum, ersteller: DUC.id});
    await MyProtokoll.save();

    const MeinGefundenerProtokoll: HydratedDocument<IProtokoll>[] = await Protokoll.find({patient: protokoll.patient, datum: protokoll.datum}).exec();

    expect(MeinGefundenerProtokoll.length).toBe(2);
    expect(MeinGefundenerProtokoll[0].patient.length).toBe(7);
    expect(MeinGefundenerProtokoll[0].patient).toBe("Mustafa");
    expect(MeinGefundenerProtokoll[0].datum).toStrictEqual(new Date(500000000000));
    expect(MeinGefundenerProtokoll[0].ersteller.toString()).toBe(DUC.id.toString());
})

test("Testen Protokoll Requierd", async() => {
    expect(new Protokoll({closed: true})).toThrowError;
    expect(new Protokoll({patient: "der Zauberer"})).toThrowError;
    expect(new Protokoll({})).toThrowError;
    expect(new Protokoll({ersteller: DUC.id})).toThrowError;
    expect(new Protokoll({ersteller: "22"})).toThrowError;
})