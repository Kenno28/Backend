import { Types } from "mongoose";
import { EintragResource } from "../Resources";
import { Eintrag } from "../model/EintragModel";
import { Pfleger } from "../model/PflegerModel";
import { Protokoll } from "../model/ProtokollModel";
import { dateToString } from "./ServiceHelper";
//Alles was undefined sein könnte sollen wir dann als undefined zurückschicken
/**
 * Gibt alle Eintraege in einem Protokoll zurück.
 * Wenn das Protokoll nicht gefunden wurde, wird ein Fehler geworfen.
 */
export async function getAlleEintraege(protokollId: string): Promise<EintragResource[]> { 
    const ein = await Eintrag.find({protokoll: protokollId}).exec();
    
    const pro = await Protokoll.findById(protokollId).exec();
    if(!pro){
        throw Error("Protokoll does not Exist");
    }
    const pfe = await Pfleger.findById(pro.ersteller).exec();
    if(!pfe){
        throw Error("Pfleger does not Exist");
    }

    return ein.map( Eintrag => {
        return{
            id: Eintrag.id.toString(),
            getraenk: Eintrag.getraenk,
            menge: Eintrag.menge,
            kommentar:  Eintrag.kommentar,
            ersteller: Eintrag.ersteller.toString(),
            erstellerName: pfe.name,
            createdAt: dateToString(Eintrag.createdAt),
            protokoll: Eintrag.protokoll.id.toString()
        }
      }
    )
}


/**
 * Liefert die EintragResource mit angegebener ID.
 * Falls kein Eintrag gefunden wurde, wird ein Fehler geworfen.
 */
export async function getEintrag(id: string): Promise<EintragResource> {
   if(!id){
    throw new Error("no valid Id");
   }

   const ein = await Eintrag.findById(id).exec();
   if(!ein){
    throw Error("Eintrag does not Exist");
   }
   const pfe = await Pfleger.findById(ein.ersteller).exec();
   if(!pfe){
    throw Error("Pfleger does not Exist");
   }
   const pro = await Protokoll.findById(ein.protokoll).exec();
   if(!pro){
    throw Error("Protokoll does not Exist");
   }

   return{
    id: ein.id,
    getraenk: ein.getraenk,
    menge: ein.menge,
    kommentar: ein.kommentar, 
    ersteller: ein.ersteller.toString(),
    erstellerName: pfe.name,
    createdAt: dateToString(ein.createdAt),
    protokoll: pro.id
   }
}

/**
 * Erzeugt eine Eintrag.
 * Daten, die berechnet werden aber in der gegebenen Ressource gesetzt sind, werden ignoriert.
 * Falls die Liste geschlossen (done) ist, wird ein Fehler wird geworfen.
 */
export async function createEintrag(eintragResource: EintragResource): Promise<EintragResource> { 
    const pfleger = await Pfleger.findById(eintragResource.ersteller).exec();
    if (!pfleger) {
        throw new Error(`No pfleger found with id ${eintragResource.ersteller}`);
    }
    const protokoll = await Protokoll.findById(eintragResource.protokoll).exec();
    if (!protokoll) {
        throw new Error(`No protokoll found with id ${eintragResource.protokoll}`);
    }
    if (protokoll.closed) {
        throw new Error(`Protokoll ${protokoll.id} is already closed`);
    }

    const eintrag = await Eintrag.create({
        getraenk: eintragResource.getraenk,
        menge: eintragResource.menge,
        kommentar: eintragResource.kommentar,
        ersteller: eintragResource.ersteller,
        protokoll: eintragResource.protokoll
    })

    return {
        id: eintrag.id,
        getraenk: eintrag.getraenk,
        menge: eintrag.menge,
        kommentar: eintrag.kommentar,
        ersteller: pfleger.id,
        erstellerName: pfleger.name,
        createdAt: dateToString(eintrag.createdAt!),
        protokoll: protokoll.id
    }
}


/**
 * Updated eine Eintrag. Es können nur Name, Quantity und Remarks geändert werden.
 * Aktuell können Eintrags nicht von einem Protokoll in einen anderen verschoben werden.
 * Auch kann der Creator nicht geändert werden.
 * Falls die Protokoll oder Creator geändert wurde, wird dies ignoriert.
 */
export async function updateEintrag(eintragResource: EintragResource): Promise<EintragResource> {
    if(!eintragResource){
        throw Error("is Null");
    }

    const ein = await Eintrag.findById(eintragResource.id).exec();
    if(!ein){
        throw Error("Eintrag nicht gefunden");
    }

    const pfe = await Pfleger.findById(ein.ersteller).exec();
    if(!pfe){
        throw Error("Pfleger does not Exist");
    }

    const pro = await Protokoll.findById(ein.protokoll).exec();
    if(!pro){
        throw Error("Protocol does not Exist");
    }

    ein.getraenk = eintragResource.getraenk;
    ein.menge = eintragResource.menge;
    ein.kommentar = eintragResource.kommentar;
    await ein.save();


    return{
        id: ein.id,
        getraenk: ein.getraenk,
        menge: ein.menge,
        kommentar: ein.kommentar,  
        ersteller: ein.ersteller.toString(), 
        erstellerName: pfe.name, 
        createdAt: dateToString(ein.createdAt),
        protokoll: pro.id
    }
}


/**
 * Beim Löschen wird das Eintrag über die ID identifiziert. 
 * Falls es nicht gefunden wurde (oder aus
 * anderen Gründen nicht gelöscht werden kann) wird ein Fehler geworfen.
 */
export async function deleteEintrag(id: string): Promise<void> {
    if(!id){
        throw new Error("No id given");
    }

    const red = await Eintrag.deleteOne({_id: new Types.ObjectId(id)}).exec();
   
    if(red.deletedCount !== 1){
        throw new Error("Eintrag not deleted");
    }
}

