import { Pfleger } from "../model/PflegerModel";
import { getAllePfleger } from "./PflegerService";

/**
 * Prüft Name und Passwort, bei Erfolg ist `success` true 
 * und es wird die `id` und `role` ("u" oder "a") des Pflegers zurückgegeben
 * 
 * Falls kein Pfleger mit gegebener Name existiert oder das Passwort falsch ist, wird nur 
 * `false` zurückgegeben. Aus Sicherheitsgründen wird kein weiterer Hinweis gegeben.
 */
export async function login(name: string, password: string): Promise<{ id: string, role: "a" | "u" } | false> {
   const list = await getAllePfleger();
    
   
    for (let index = 0; index < list.length; index++) {
        
        if(list[index].name === name){
            const pfleger = await Pfleger.findOne({name: name}).exec();
           
            if(pfleger){
            if(await pfleger.isCorrectPassword(password)){
                if(pfleger.admin){return{ id:pfleger.id, role: "a"}}
                else{ return{ id:pfleger.id, role: "u"}}
            }
          }
        } 
    }
    
    return false;
}