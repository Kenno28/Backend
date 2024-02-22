import express from "express"; 
import * as Eintrag from "../services/EintragService";
import { EintragResource } from "../Resources";
import { body, matchedData, param, validationResult } from "express-validator";
import { optionalAuthentication, requiresAuthentication } from "./authentication";
import { getProtokoll} from "../services/ProtokollService";

export const eintragRouter = express.Router();

eintragRouter.post("/",
requiresAuthentication,
body("getraenk").isString().isLength({min:1 , max: 100}),
body("kommentar").optional().isString().isLength({min: 1, max: 1000}),
body("menge").isNumeric(),
body("ersteller").isMongoId(),
body("erstellerName").optional().isString().isLength({min: 1, max: 100}),
body("createdAt").optional().isString().isLength({min: 1, max: 100}),
body("protokoll").isMongoId(), async (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400)
        .json({errors: errors.array()});
    }
    
    try {
        const eintragData = matchedData(req) as EintragResource;
        const protokoll = await getProtokoll(eintragData.protokoll);

        if((req.pflegerId !== protokoll.ersteller) && protokoll.public === false){ //testen
            res.sendStatus(403);
            next();
            return;
        }

        const createEintragResource = await Eintrag.createEintrag(eintragData);
        return res.status(201).send(createEintragResource);    
    } catch (error){
        res.sendStatus(404);
        next(error);
        return;
    }

})

eintragRouter.get("/:id",
optionalAuthentication,
param("id").isMongoId(), async(req, res, next) =>{

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400)
        .json({errors: errors.array()});
    }

    let id= req.params!.id;

    try {
        const eintrag = await Eintrag.getEintrag(id);
        const pro = await getProtokoll(eintrag.protokoll);


        if(pro.public){
            return res.status(200).send(eintrag);
        } else if(!pro.public && (req.pflegerId === eintrag.ersteller || req.pflegerId === pro.ersteller)){
            return res.status(200).send(eintrag);
        } else {
            res.sendStatus(403);
            next();
            return
        }

    } catch (error) {
        res.sendStatus(404);
        next(error);
        return
    }

})

eintragRouter.put("/:id",
requiresAuthentication,
param("id").isMongoId(),
body("id").isMongoId(),
body("menge").isNumeric(),
body("getraenk").isString().isLength({min:1 , max: 100}),
body("kommentar").optional().isString().isLength({min: 1, max: 1000}),
body("ersteller").isMongoId(),
body("erstellerName").optional().isString().isLength({min: 1, max: 100}),
body("createdAt").optional().isString().isLength({min: 1, max: 100}),
body("protokoll").isMongoId(), async(req, res, next) => {
   
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400)
        .json({errors: errors.array()});
    }


    let id= req.params!.id;

    try {

        const eintragData = matchedData(req) as EintragResource;

        if(id !== eintragData.id){
            return res.status(400).json({
                errors: [
                    {
                        location: "params",
                        param: "id",
                        value: id
                    },
                    {
                        location: "body",
                        param: "id",
                        value: eintragData.id
                    } 
                ]
            });
        }
        let ein = await Eintrag.getEintrag(id);
        let pro = await  getProtokoll(ein.protokoll);
        if(req.pflegerId === ein.ersteller || req.pflegerId === pro.ersteller){
        const ein = await Eintrag.updateEintrag(eintragData);
        return res.status(200).send(ein);

        } else {
            res.sendStatus(403);
            next();
            return;
        }

    } catch (error) {
        res.sendStatus(404);
        next(error);
        return;
    }

})

eintragRouter.delete("/:id",
requiresAuthentication,
param("id").isMongoId(), async (req, res, next) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400)
        .json({errors: errors.array()});
    }


    let id= req.params!.id;

   
    try{
        let ein = await Eintrag.getEintrag(id);
        let pro = await  getProtokoll(ein.protokoll);

        if(req.pflegerId === ein.ersteller || req.pflegerId === pro.ersteller){ 
        await Eintrag.deleteEintrag(id);
        res.status(204).send()
        return;
        } else{
            res.sendStatus(403);
            next();
            return;
    }
    
    } catch (error) {
        res.sendStatus(404);
        next(error);
        return;
     }


})