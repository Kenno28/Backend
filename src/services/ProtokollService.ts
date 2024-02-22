import { ObjectId, Types } from "mongoose";
import { PflegerResource, ProtokollResource } from "../Resources";
import { Eintrag } from "../model/EintragModel";
import { IPfleger, Pfleger } from "../model/PflegerModel";
import { Protokoll } from "../model/ProtokollModel";
import { dateToString, stringToDate } from "./ServiceHelper";

// .filter https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter

/**
 * Gibt alle Protokolls zurück, die für einen Pfleger sichtbar sind. Dies sind:
 * - alle öffentlichen (public) Protokolls
 * - alle eigenen Protokolls, dies ist natürlich nur möglich, wenn die pflegerId angegeben ist.
 */
export async function getAlleProtokolle(pflegerId?: string): Promise<ProtokollResource[]> {
    // public Protokolls
    let protokolls = await Protokoll.find({ public: true }).exec();

    if (pflegerId) {
        // private Protokolls
        const privateProtokolls = await Protokoll.find({ ersteller: pflegerId, public: false }).exec();

        // Combine public & private Protokolls, so there R no duplicates
        protokolls = [...protokolls, ...privateProtokolls.filter(privateProtokoll =>
            !protokolls.some(publicProtokoll => publicProtokoll._id.equals(privateProtokoll._id))
        )];
    }

    // die gesamtMenge für jedes Protokoll berechnen und es zu ProtokollResource konvertieren
    const protokollResource = await Promise.all(protokolls.map(async (protokoll) => {

        const eintraege = await Eintrag.find({ protokoll: protokoll._id }).exec();

        const gesamtmenge = eintraege.reduce((sum, eintrag) => sum + eintrag.menge, 0);

        const pflegerbeispiel = await Pfleger.findById(protokoll.ersteller).exec();

        return {
            id: protokoll._id.toString(),
            patient: protokoll.patient,
            datum: dateToString(protokoll.datum),
            public: protokoll.public,
            closed: protokoll.closed,
            ersteller: protokoll.ersteller.toString(),
            erstellerName: pflegerbeispiel?.name,
            gesamtMenge: gesamtmenge,
            updatedAt: dateToString(protokoll.updatedAt)
        };
    }));

    return protokollResource;
}


/**
 * Liefer die Protokoll mit angegebener ID.
* Falls keine Protokoll gefunden wurde, wird ein Fehler geworfen.
*/
export async function getProtokoll(id: string): Promise<ProtokollResource> {

    if(!id || id === ""){
        throw Error("no Id given"); 
    }

    const protokoll = await Protokoll.findById(id).exec();
    let gesamteMenge=0; 
    if(!protokoll){ 
        throw Error("No protocol found");
    }

    const pfleger = await Pfleger.findById(protokoll?.ersteller).exec();

    if(!pfleger){
        throw Error("no such Pfleger found");
    }

    try{
        let ein = await Eintrag.find({protokoll: id}).exec();
          
        for (let index = 0; index < ein.length; index++) {
          const element = ein[index];
          gesamteMenge += element.menge;
        }
    } catch{}
    return{
        id: protokoll.id,
        patient: protokoll.patient,
        datum: dateToString(protokoll.datum),
        public:  protokoll.public,
        closed: protokoll.closed,
        ersteller: protokoll.ersteller.toString(),
        erstellerName:  pfleger.name,
        updatedAt:  dateToString(protokoll.updatedAt),
        gesamtMenge: gesamteMenge 
    }
}

/**
 * Erzeugt das Protokoll.
 */
export async function createProtokoll(protokollResource: ProtokollResource): Promise<ProtokollResource> { 
    const as = await Pfleger.findById(protokollResource.ersteller).exec();
    if(!as){
        throw new Error("No Pfleger found");
    }
    const protokoll = await Protokoll.create({id: protokollResource.id, patient: protokollResource.patient, datum: stringToDate(protokollResource.datum), public: protokollResource.public, closed: protokollResource.closed, ersteller: protokollResource.ersteller});

    return{
        id: protokoll.id,
        patient: protokoll.patient,
        datum: dateToString(protokoll.datum),
        public: protokoll.public,
        closed:   protokoll.closed,
        ersteller: as.id,
        erstellerName: as.name,
        updatedAt: dateToString(protokoll.updatedAt)
    }
}

/**
 * Ändert die Daten einer Protokoll.
 */
export async function updateProtokoll(protokollResource: ProtokollResource): Promise<ProtokollResource> {  //Berechnente Attributen sind sachen, die nicht von Mongoose selsbt gestzt werden
   const foundprotkoll = await Protokoll.findById(protokollResource.id).exec();

   if(!foundprotkoll){
     throw new Error("No protocol been found");
   }
   
   foundprotkoll.patient = protokollResource.patient;
   foundprotkoll.datum = stringToDate(protokollResource.datum);
   foundprotkoll.public = protokollResource.public;
   foundprotkoll.ersteller = new Types.ObjectId(protokollResource.ersteller); 
   foundprotkoll.closed = protokollResource.closed;

   await foundprotkoll.save();

   let pro = await Protokoll.findById(foundprotkoll.id).exec();
   if(!pro){
    
   }
   let pfe = await Pfleger.findById(pro!.ersteller).exec();

   return{
    id: foundprotkoll.id,
    patient: foundprotkoll.patient,
    datum: dateToString(foundprotkoll.datum),
    public: foundprotkoll.public,
    closed: foundprotkoll.closed,
    ersteller: foundprotkoll.ersteller.toString(),
    erstellerName:  pfe!.name,
    gesamtMenge: protokollResource.gesamtMenge ,
    updatedAt: dateToString(pro!.updatedAt)
   }
}

/**
 * Beim Löschen wird die Protokoll über die ID identifiziert.
 * Falls keine Protokoll nicht gefunden wurde (oder aus
 * anderen Gründen nicht gelöscht werden kann) wird ein Fehler geworfen.
 * Wenn die Protokoll gelöscht wird, müssen auch alle zugehörigen Eintrags gelöscht werden.
 */
export async function deleteProtokoll(id: string): Promise<void> { 

    if(!id){
        throw Error("No id given");
    }

    let pro = await Protokoll.findById(id).exec();
    

    const red = await Protokoll.deleteOne({_id: new Types.ObjectId(id)}).exec();
    
    if(red.deletedCount !== 1){
        throw  Error("Protocol not deleted");
    } else{
        await Eintrag.deleteMany({protokoll: pro!.id});
    }

}    
