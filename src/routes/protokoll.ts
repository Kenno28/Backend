import express from "express";
import { getAlleEintraege } from "../services/EintragService";
import * as pro from "../services/ProtokollService"
import { ProtokollResource } from "../Resources";
import { body, matchedData, param, validationResult } from "express-validator";
import { optionalAuthentication, requiresAuthentication } from "./authentication";

export const protokollRouter = express.Router();

protokollRouter.get("/:id/eintraege", 
optionalAuthentication,
 param("id").isMongoId(), async (req, res, next) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            return res.status(400)
            .json({errors: errors.array()});
        }

    const id = req.params!.id;
    try {
        const eintraege = await getAlleEintraege(id); 
        res.send(eintraege); // 200 by default
    } catch (err) {
        res.status(404); // not found
        next(err);
    }
})

protokollRouter.post("/",
requiresAuthentication,
body("patient").isString().isLength({min:1, max:10}),
body("datum").isString().isLength({min: 1, max: 100}),
body("public").optional().isBoolean(),
body("closed").optional().isBoolean(),
body("ersteller").isMongoId(),
body("erstellerName").optional().isString().isLength({min: 1, max: 100}),
body("updatedAt").optional().isString().isLength({min: 1, max: 100}),
body("gesamtMenge").optional().isNumeric(), async (req, res, next) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400)
        .json({errors: errors.array()});
    }

    try {
        const protokollData = matchedData(req) as ProtokollResource;
        if(protokollData.ersteller != req.pflegerId){
            return res.status(400).send("pflegerId inkonsistent");
        }
        const createdProtokoll = await pro.createProtokoll(protokollData);
        res.status(201).send(createdProtokoll);
    } catch (error) {
        res.status(404);
        next(error);
    }
})

protokollRouter.get("/alle",optionalAuthentication, async (req, res, next) => {
        let id = req.pflegerId;
        console.log("A" + id);
   try{
    const allPro = await pro.getAlleProtokolle(id);
    res.send(allPro)
   }catch(error){
        res.sendStatus(400);
        next(error);
    }
})

protokollRouter.get("/:id", 
optionalAuthentication,
param("id").isMongoId(), async (req, res, next) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400)
        .json({errors: errors.array()}).send();
    }

   try {
        const foundProtokoll = await pro.getProtokoll(req.params!.id);
         //Wenn das Protokoll öffentlich ist, dann gib es zurück
         if(foundProtokoll.public){
            res.status(200).send(foundProtokoll);
           }

        //Wenn es Privat ist und der Ersteller der angegebene Pfleger ist, dann gib das Protokoll zurück
        if(!foundProtokoll.public && foundProtokoll.ersteller === req.pflegerId){
            res.status(200).send(foundProtokoll);//testen ob, wenn anderer pfleger und private
        } else {
            res.sendStatus(401);
            next();
        }
   } catch (error) {
        res.sendStatus(404);
        next(error)
        return
   }
})

protokollRouter.put("/:id",
requiresAuthentication,
param("id").isMongoId(),
body("id").isMongoId(),
body("patient").isString().isLength({min:1, max:100}),
body("datum").isString().isLength({min: 1, max: 100}),
body("public").optional().isBoolean(),
body("closed").optional().isBoolean(),
body("ersteller").isMongoId(),
body("erstellerName").optional().isString().isLength({min: 1, max: 100}),
body("updatedAt").optional().isString().isLength({min: 1, max: 100}),
body("gesamtMenge").optional().isNumeric(), async (req, res, next) => {
   
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400)
        .json({errors: errors.array()});
    }

    const id = req.params!.id;
    try {
        const protokollData = matchedData(req) as ProtokollResource;
       
        if(id !== protokollData.id){
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
                        value: protokollData.id
                    } 
                ]
            });
        }
        if(protokollData.ersteller !== req.pflegerId){
            res.sendStatus(403);
            next();
        }

        const prot = await pro.updateProtokoll(protokollData);
        res.status(200).send(prot);
    } catch (error) {
        res.sendStatus(404);
        next(error);
    }
})

protokollRouter.delete("/:id",
requiresAuthentication,
param("id").isMongoId(), async (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400)
        .json({errors: errors.array()});
    }

   try {
    const prop = await pro.getProtokoll(req.params!.id);

    if(prop.ersteller !== req.pflegerId){ //testen
        res.sendStatus(403)
        next()
    }
    await pro.deleteProtokoll(req.params!.id);
    res.sendStatus(204);
   } catch (error) {
    res.sendStatus(400);
    next(error);
   } 
})