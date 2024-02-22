
import { Pfleger, IPfleger } from "../../src/model/PflegerModel";
import { HydratedDocument} from "mongoose"; 

let pfleger: HydratedDocument<IPfleger>;

beforeEach(async () => {
   pfleger = await Pfleger.create({name: "Sabine", password: "223" });
});

test("Testen Pfleger Basiscs", async() => {
    const MyPfleger = new Pfleger({name: "Eray" , password: "223", admin: true});
    await MyPfleger.save();
    expect(MyPfleger.password).not.toBe("223");
  
    
    const MeinGefundenerPfleger: HydratedDocument<IPfleger>[] = await Pfleger.find({password: pfleger.password}).exec();

    expect(MeinGefundenerPfleger[0].name.length).toBe(6);
    expect(MeinGefundenerPfleger[0].admin).toBeFalsy();
    expect(pfleger.name).toBe("Sabine");
    expect(MeinGefundenerPfleger[0].password.length).not.toBe(3);
    expect(MyPfleger.admin).toBeTruthy();

})

test("Pfleger requiered testen", async() => {
    expect(new Pfleger({name: "Oguz"})).toThrowError;
    expect(new Pfleger({password: "222"})).toThrowError;
    expect(new Pfleger({})).toBeUndefined;
    expect(new Pfleger({name: 22})).toThrowError;
})

test("Unique testen", async() => {
    const Oguz = new Pfleger({name:"Oos", password:"123"});
    await Oguz.save();
    expect(new Pfleger({name:"Oos", password: "123"})).toThrowError;
})

test("Hashen & Updaten probieren", async () => {
    let pfleger = new Pfleger({ name: "LevoNoKeko", password: "223",  });
    await pfleger.save();

    // Das Passwort updaten
    const newPassword = "papagei";
    await Pfleger.updateOne({ name: "Eray Zor" }, { password: newPassword });

    // Den aktualisierten Pfleger aus der Datenbank holen
    const updatedPfleger = await Pfleger.findOne({ name: "Eray Zor" });

    // Überprüfen, ob das Passwort gehasht wurde
    if(updatedPfleger != null){
    expect(updatedPfleger.password).not.toEqual(newPassword);
    expect(updatedPfleger.name).toBe("Eray Zor");
    }
});

test("Hash Password Compare" , async () => {
    let pfleger = new Pfleger({name: "Dieter", password: "Maya"});
    let pfleger2 = new Pfleger({name: "Jaeger", password: "222"});
    //nicht gehasht
    await expect(async () => await pfleger.isCorrectPassword(pfleger.password)).rejects.toThrowError("Password is not hashed.");
    await expect(async () => await pfleger.isCorrectPassword(pfleger2.password)).rejects.toThrowError("Password is not hashed.");

    //nicht gehasht aber gleiches Passwort
    await expect(async () => await pfleger2.isCorrectPassword("222")).rejects.toThrowError("Password is not hashed.");
    await expect(async () => await pfleger.isCorrectPassword("Maya")).rejects.toThrowError("Password is not hashed.");

    await pfleger.save();
    await pfleger2.save();

    //zwei falsche passwörter
    expect( await pfleger.isCorrectPassword("Urgot")).toBeFalsy();
    expect( await pfleger2.isCorrectPassword("333")).toBeFalsy();

    // Testen, ob die Passwörter korrekt sind
     expect(await pfleger.isCorrectPassword("Maya")).toBeTruthy();
     expect(await pfleger2.isCorrectPassword("222")).toBeTruthy();
})