import {Schema, model, Types, Model} from "mongoose"
import * as bcrypt from "bcryptjs"; 


export interface IPfleger{
    name: string;
    password: string;
    admin?: boolean;
}

interface IPflegerMethods{
    isCorrectPassword(password: string): Promise<boolean>;
}

type PflegerModel = Model<IPfleger, {}, IPflegerMethods>;


const PflegerSchema = new Schema<IPfleger, PflegerModel, IPflegerMethods>({
    name: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    admin: {type: Boolean, default: false}
})



PflegerSchema.method("isCorrectPassword", 
    async function (password: string): Promise<boolean>{
        
        if(!this.password.startsWith("$2a$")){
            throw new Error("Password is not hashed.");
        }
            
        return await bcrypt.compare(password, this.password);
    }
) 


PflegerSchema.pre("save", async function(){
    if (this.isModified("password")) {
        this.password   = await bcrypt.hash(this.password, 10);
      
        }
});

PflegerSchema.pre("updateOne", async function () {

    const updatedObject = this.getUpdate(); 
    if (updatedObject && "password" in updatedObject) {

        updatedObject.password  = await bcrypt.hash(updatedObject.password, 10); 
    }
});


export const Pfleger = model<IPfleger, PflegerModel>("MyPfleger", PflegerSchema);



