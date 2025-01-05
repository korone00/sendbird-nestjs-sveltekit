import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ChatModule,
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validationSchema: Joi.object({
        SENDBIRD_APP_ID: Joi.string().required(),
        SENDBIRD_API_TOKEN: Joi.string().required(),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
