// merchantModel.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface Merchant extends Document {
  storeID: string;
  merchantName: string;
  email: string;
  commission: number;
}

const merchantSchema: Schema = new Schema({
  storeID: { type: String, required: true },
  merchantName: { type: String, required: true },
  email: { type: String, required: true },
  commission: { type: Number, required: true },
});

const MerchantModel = mongoose.model<Merchant>('Merchant', merchantSchema);

export default MerchantModel;
