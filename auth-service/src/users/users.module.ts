import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { getModelForClass } from '@typegoose/typegoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: getModelForClass(User).schema,
      },
    ]),
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
