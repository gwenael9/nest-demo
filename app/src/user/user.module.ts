import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserEntity } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatEntity } from '@/cat/cat.entity';
import { CatModule } from '@/cat/cat.module';
import { CommentaireModule } from '@/commentaire/commentaire.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, CatEntity]),
    forwardRef(() => CatModule),
    forwardRef(() => AuthModule),
    CommentaireModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
