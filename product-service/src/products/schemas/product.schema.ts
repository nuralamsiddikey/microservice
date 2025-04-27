import { prop } from '@typegoose/typegoose';
import { Types } from 'mongoose';

export class Product {
  _id?: Types.ObjectId;

  @prop({ required: true })
  name: string;

  @prop({ required: true })
  description: string;

  @prop({ required: true })
  price: number;

  @prop({ required: true })
  userId: string;
}

export const ProductSchema = { name: Product.name };
