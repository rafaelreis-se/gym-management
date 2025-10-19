import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Nfse } from '@gym-management/domain';
import { NfseService } from './nfse.service';
import { NfseController } from './nfse.controller';
import { NfseWebService } from './services/nfse-webservice.service';
import { XmlSigningService } from './services/xml-signing.service';
import { NfseWorkflowService } from './services/nfse-workflow.service';
import { NfseNotificationService } from './services/nfse-notification.service';
import { EmailService } from './services/email.service';
import { RetryService } from './services/retry.service';

@Module({
  imports: [TypeOrmModule.forFeature([Nfse])],
  controllers: [NfseController],
  providers: [
    NfseService,
    NfseWebService,
    XmlSigningService,
    NfseWorkflowService,
    NfseNotificationService,
    EmailService,
    RetryService,
  ],
  exports: [NfseService],
})
export class NfseModule {}
