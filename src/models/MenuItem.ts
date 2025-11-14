// models/MenuItem.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IMenuItem extends Document {
  name: string;
  price: number;
  validade: Date;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema: Schema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  validade: { type: Date, required: true },
  image: { type: String, default: null }, // <-- campo para URL da imagem
}, {
  timestamps: true,
});

export default mongoose.models.MenuItem || mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
