import {
  ClassSerializerInterceptor,
  INestApplication,
  MiddlewareConsumer,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { CatModule } from './cat/cat.module';
import { LoggerMiddleware } from './logger/logger.middleware';
import { BreedModule } from './breed/breed.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config';
import { Reflector } from '@nestjs/core';
import { LiveModule } from './live/live.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CommentaireModule } from './commentaire/commentaire.module';
import { CrossRequestModule } from './cross-request/cross-request.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(databaseConfig),
    EventEmitterModule.forRoot(),
    CatModule,
    BreedModule,
    LiveModule,
    UserModule,
    AuthModule,
    CommentaireModule,
    CrossRequestModule,
  ],
  controllers: [AppController],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

export function registerGlobals(app: INestApplication) {
  // Enable validation globally
  // This will automatically validate all incoming requests using the DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // will remove any properties that are not defined in the DTO
      transform: true, // will convert incoming values to the correct types
    }),
  );

  // Enable class serialization globally
  // This will automatically serialize all responses using the @Exclude decorator
  // Sensitive fields will always be excluded from responses
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
}
