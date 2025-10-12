import { Module } from '@nestjs/common';
import {
  ConfigService,
  ConfigModule as NestConfigModule,
} from '@nestjs/config';
import { applicationSchema, databaseSchema, authSchema } from './schemas';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env['NODE_ENV'] === 'test' ? '.env.test' : '.env',
      cache: true,
      validationSchema: applicationSchema
        .concat(databaseSchema)
        .concat(authSchema),
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}

