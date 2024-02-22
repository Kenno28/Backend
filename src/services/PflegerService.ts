import { Types } from "mongoose";
import { PflegerResource } from "../Resources";
import { Eintrag } from "../model/EintragModel";
import { Pfleger, IPfleger } from "../model/PflegerModel";
import { Protokoll } from "../model/ProtokollModel";


/**
 * Die Passwörter dürfen nicht zurückgegeben werden.
 */
export async function getAllePfleger(): Promise<PflegerResource[]> {
    const pflegers = await Pfleger.find().exec();

    return pflegers.map( Pfleger => {
        return{
        id: Pfleger.id!,
        name: Pfleger.name!,
        admin: Pfleger.admin!,
        }
    })
}

/**
 * Erzeugt einen Pfleger. Das Password darf nicht zurückgegeben werden.
 */
export async function createPfleger(pflegerResource: PflegerResource): Promise<PflegerResource> {
    const pfleger = await Pfleger.create({name: pflegerResource.name, password:pflegerResource.password, admin: pflegerResource.admin});

   
    return {

        id: pfleger.id,
        name: pfleger.name,
        admin: pfleger.admin!
        
    }
}


/**
 * Updated einen Pfleger.
 * Beim Update wird der Pfleger über die ID identifiziert.
 * Der Admin kann einfach so ein neues Passwort setzen, ohne das alte zu kennen.
 */
export async function updatePfleger(pflegerResource: PflegerResource): Promise<PflegerResource> {

   let foundPfleger = await Pfleger.findById(pflegerResource.id).exec();
  

   if (!foundPfleger) {
    throw Error("No pfleger with id " + pflegerResource.id + " could not been found.");
   }
 
   


    foundPfleger.name = pflegerResource.name;
    foundPfleger.admin = pflegerResource.admin;
    
    if(pflegerResource.password){
    foundPfleger.password = pflegerResource.password!;
    }

    await foundPfleger.save();
   return {
    name:foundPfleger.name,
    admin:foundPfleger.admin!,
    id:foundPfleger.id
   }
 
}

/**
 * Beim Löschen wird der Pfleger über die ID identifiziert.
 * Falls Pfleger nicht gefunden wurde (oder aus
 * anderen Gründen nicht gelöscht werden kann) wird ein Fehler geworfen.
 * Wenn der Pfleger gelöscht wird, müssen auch alle zugehörigen Protokolls und Eintrags gelöscht werden.
 */
export async function deletePfleger(id: string): Promise<void> { 
    if(!id){
        throw new Error("No id given");
    }
    
    let pfe =  await Pfleger.findById(id);
  
    const red = await Pfleger.deleteOne({_id: new Types.ObjectId(id)}).exec();
   
    if(red.deletedCount !== 1){
        throw new Error("Pfleger not deleted");
    } else{

        await Protokoll.deleteMany({ersteller: pfe!.id}).exec(); 
        await Eintrag.deleteMany({ersteller: pfe!.id}).exec(); 
    }

  
}