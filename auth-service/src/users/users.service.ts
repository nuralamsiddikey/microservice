import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(user: Partial<User>): Promise<User> {
    if (!user.password) {
      throw new Error('Password is required');
    }
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = new this.userModel({
      ...user,
      password: hashedPassword,
    });
    return await newUser.save();
  }

  async findByEmail(email: string): Promise<User | null>{
    return this.userModel.findOne({email}).exec()
  }

  async findById(id: string): Promise<User | null>{
    return this.userModel.findById(id).exec()
  }
}
