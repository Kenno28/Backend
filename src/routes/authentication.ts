import { NextFunction, Request, Response } from "express";
import { verifyJWT } from "../services/JWTService";

declare global {
    namespace Express {
        export interface Request {
            /**
             * Mongo-ID of currently logged in pfleger; or undefined, if pfleger is a guest.
             */
            pflegerId?: string;
            /**
             * Role of currently logged in pfleger; or undefined, if pfleger is a guest.
             */
            role?: "u" | "a";
        }
    }
}

export function requiresAuthentication(req: Request, res: Response, next: NextFunction) {
    req.pflegerId = undefined;

    try {
        
        let jwtString=req.cookies["access_token"]
        if(!jwtString){
            res.sendStatus(401);
        }

        const pfleger = verifyJWT(jwtString);

        

        req.pflegerId = pfleger.id;
        req.role = pfleger.role;
        

        next();

        } catch (err) {

        res.status(401); 
        return next(err);

        }
}

export function optionalAuthentication(req: Request, res: Response, next: NextFunction) { //später teste
   req.pflegerId = undefined;

   let jwtString=req.cookies["access_token"]


        if (jwtString) {
            try {
        
                const pfleger = verifyJWT(jwtString);
          
                if(pfleger.exp === 0){
                    res.sendStatus(401);
                }
            
                req.pflegerId = pfleger.id;
                req.role = pfleger.role;
                

                return next();
            } catch (err) {
                 res.status(401);
                 return next();
            }
        }

        next();
}

