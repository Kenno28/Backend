import {Schema, model, Types} from "mongoose"

export interface IProtokoll{
    patient:string;
    datum:Date;
    public?:boolean;
    closed?:boolean;
    updatedAt:Date;
    ersteller: Types.ObjectId ;
}

const ProtokollSchema = new Schema<IProtokoll>({
    ersteller:{type: Schema.Types.ObjectId, ref: "Pfleger", required: true},
    patient: {type: String, required: true},
    datum: {type: Date, required: true},
    public: {type: Boolean, default: false},
    closed: {type: Boolean, default: false},
}, {timestamps: true })

export const Protokoll = model("MyProtokoll", ProtokollSchema);