import express from "express";
import { body, matchedData, param, validationResult } from "express-validator"
import { verifyJWT, verifyPasswordAndCreateJWT } from "../services/JWTService";


export const loginRouter = express.Router()

loginRouter.post("/", 
body("name").isString().isLength({min:1 , max: 100}),
body("password").isString().isStrongPassword().isLength({min:1,max:100}), async  (req, res, next) => {

    
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400)
        .json({errors: errors.array()});
    }


    try {
        const loginData = matchedData(req);
        const jwtTokenString = await verifyPasswordAndCreateJWT(loginData.name, loginData.password);
        const log = verifyJWT(jwtTokenString)
       res.cookie("access_token", jwtTokenString, {httpOnly: true,  
                secure: true,  
                expires: new Date(Date.now() + 3600000),
                sameSite: 'none'  });

        res.status(201).send(log);
        return;
    } catch (error) {
        res.sendStatus(200); //Sollen wir so machen
        next(error);
        return;
    }

})

loginRouter.get("/", async  (req, res, next) => {

   

    try {
        const jwtString = req.cookies.access_token;
        const loginData = verifyJWT(jwtString);
        res.status(200).send(loginData);
        return;
    } catch (error) {
        res.status(400); // most likley falsch
        res.clearCookie("access_token",{
            httpOnly: true,
            secure: true, 
            sameSite: 'none',
            expires: new Date(0)
        });
        res.send(false);
        next(error);
        return;
    }
})


loginRouter.delete("/", async (req, res, next) => {

    res.clearCookie("access_token",{
        httpOnly: true,
        secure: true, 
        sameSite: 'none',
        expires: new Date(0)
    });
    res.sendStatus(204);
    next();
    return;
})



