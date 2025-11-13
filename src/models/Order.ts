import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  menuItem: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  endereco: string;
  items: IOrderItem[];
  status: 'Recebido' | 'Em Preparo' | 'Entregue';
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema: Schema = new Schema({
  menuItem: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const OrderSchema: Schema = new Schema({
  endereco: { type: String, required: true },
  items: [OrderItemSchema],
  status: { type: String, enum: ['Recebido', 'Em Preparo', 'Entregue'], default: 'Recebido' },
  total: { type: Number, required: true },
}, {
  timestamps: true,
});

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
