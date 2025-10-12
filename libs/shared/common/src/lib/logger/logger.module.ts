import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get('NODE_ENV', 'development');
        const logLevel = configService.get('LOG_LEVEL', 'info');
        const logFormat = configService.get('LOG_FORMAT', 'pretty');

        const isProduction = nodeEnv === 'production';

        return {
          pinoHttp: {
            level: logLevel,
            // Production vs Development transport
            transport:
              isProduction || logFormat === 'json'
                ? undefined // Raw JSON for production
                : {
                    target: 'pino-pretty',
                    options: {
                      singleLine: true,
                      colorize: true,
                      translateTime: 'yyyy-mm-dd HH:MM:ss',
                      ignore: 'pid,hostname',
                    },
                  },

            // Custom log format for structured logging
            formatters: {
              level: (label: string) => ({ level: label }),
            },

            // Base logging configuration
            base: {
              service: configService.get(
                'SERVICE_NAME',
                'gym-management-api'
              ),
              environment: nodeEnv,
            },
          },
        } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      },
    }),
  ],
})
export class LoggerModule {}

