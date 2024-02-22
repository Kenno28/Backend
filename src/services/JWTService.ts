import { LoginResource } from "../Resources";
import { JsonWebTokenError, JwtPayload, sign, verify } from "jsonwebtoken";
import { login } from "./AuthenticationService";
import { Pfleger } from "../model/PflegerModel";



export async function verifyPasswordAndCreateJWT(name: string, password: string): Promise<string | undefined> {
    const secret = process.env.JWT_SECRET;
    const TTL = Number.parseInt(process.env.JWT_TTL!) * 1000;

    if(!secret || !TTL){
        throw new Error("Secret is Undefined");
    }
     
   const isTrue = await login(name, password);
    if(isTrue){

    const payload: JwtPayload = {
            sub: isTrue.id,
            role: isTrue.role
    }

    return sign(
        payload,
        secret,
        {
        expiresIn: TTL,
        algorithm: "HS256"
        }
    );
    }
}

export function verifyJWT(jwtString: string | undefined): LoginResource {
    if(!jwtString){
        throw new Error("String is not defined");
    }

    const secret = process.env.JWT_SECRET;
    const ttl = process.env.JWT_TTL;
    if(!secret || !ttl){
        throw new Error("Secret or TTL is Undefined");
    }

    const payload =  verify(jwtString, secret);
    if(!payload){
        throw JsonWebTokenError;
    }

    if(payload instanceof Object) {
        return {id : payload.sub!, role : payload.role, exp: payload.exp!} as LoginResource;
    } else {
        throw JsonWebTokenError;
    }
}
