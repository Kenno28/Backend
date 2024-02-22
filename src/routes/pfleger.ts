import express from "express"; 
import * as H from "../services/PflegerService";
import { PflegerResource } from "../Resources";
import { body, matchedData, param, validationResult } from "express-validator";
import { optionalAuthentication, requiresAuthentication } from "./authentication";


export const pflegerRouter = express.Router();

pflegerRouter.get("/alle",
optionalAuthentication,
async (req, res, next) => {
    if(req.role !== "a"){
        return res.status(401).send("Not an Admin");
    }
    try{
        const pflegerUser = await H.getAllePfleger();
        res.send(pflegerUser);
        return;
    } catch(error){
        res.status(400);
        next(error);
        return;
    }
})

pflegerRouter.post("/",
requiresAuthentication,
body("name").isString().isLength({min: 1, max: 100}),
body("admin").optional().isBoolean(),
body("password").isString().isStrongPassword().isLength({min:1,max:100}), async (req, res, next) =>{
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400)
        .json({errors: errors.array()});
    }

    try{
        const pflegerData = matchedData(req) as PflegerResource;
        if(req.role !== "a"){
            return res.status(401).send("Not an Admin");
        }
        const createPflegerResource = await H.createPfleger(pflegerData);
        res.status(201).send(createPflegerResource);
        return;
    } catch(err){
        res.status(400);
        next(err);
        return;
    }
})

pflegerRouter.put("/:id",
requiresAuthentication, 
body("id").isMongoId(),
param("id").isMongoId(),
body("name").isString().isLength({min: 1, max: 100}),
body("admin").isBoolean(),
body("password").optional().isString().isStrongPassword().isLength({min:1,max:100}), async (req, res, next) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400)
        .json({errors: errors.array()});
    }
      
    const id = req.params!.id;
 
    if(id !== req.body.id){
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
                    value: req.body.id
                } 
            ]
        });
    }


    try{
        const pflegerData = matchedData(req) as PflegerResource;
        if(req.role !== "a"){
            return  res.sendStatus(401).send("Not an Admin");
        }
        
        // if(pflegerData.id !== req.pflegerId){
        //      return res.status(400).send("pflegerId inkonsistent");
        //  }

        const updatePfleger = await H.updatePfleger(pflegerData);
        return res.status(200).send(updatePfleger);
    }catch(err){
        res.status(400);
        next(err);
        return;
    }
})

pflegerRouter.delete("/:id",
requiresAuthentication,
param("id").isMongoId(), async (req, res, next) => {
    const id = req.params!.id;
    const errors = validationResult(req);
    
    if(!errors.isEmpty()){
        return res.status(400)
        .json({errors: errors.array()});
    }
    
    if(req.role !== "a"){
       return res.status(401).send("Not an Admin");
    }

    if(req.pflegerId === id){
       return res.status(403).send("Can not delete yourself")
    }

    try {
        await H.deletePfleger(id);
        return  res.status(204).send();
    } catch (error) {
        res.status(400);
        next(error);
        return
    }
    
})