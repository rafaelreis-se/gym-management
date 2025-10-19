import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nfse } from '@gym-management/domain';
import { NfseStatus } from '@gym-management/types';
import { NfseWebService } from './nfse-webservice.service';
import { XmlSigningService } from './xml-signing.service';
import { RetryService } from './retry.service';

export interface NfseWorkflowResult {
  success: boolean;
  newStatus: NfseStatus;
  message: string;
  data?: any;
}

/**
 * Service responsible for managing NFS-e workflow states
 * This follows professional patterns used by major companies
 */
@Injectable()
export class NfseWorkflowService {
  private readonly logger = new Logger(NfseWorkflowService.name);

  constructor(
    @InjectRepository(Nfse)
    private readonly nfseRepository: Repository<Nfse>,
    private readonly webService: NfseWebService,
    private readonly xmlSigningService: XmlSigningService,
    private readonly retryService: RetryService
  ) {}

  /**
   * Step 1: Create RPS (Recibo Provisório de Serviços)
   * This is the initial state - just a draft
   */
  async createRps(nfseData: any): Promise<NfseWorkflowResult> {
    try {
      this.logger.log('Creating RPS...');

      const nfse = this.nfseRepository.create({
        ...nfseData,
        status: NfseStatus.DRAFT,
        number: parseInt(this.generateRpsNumber().replace('RPS', '')),
        series: 'NF',
        emissionDate: new Date(),
      });

      const savedNfse = await this.nfseRepository.save(nfse);

      return {
        success: true,
        newStatus: NfseStatus.DRAFT,
        message: 'RPS created successfully',
        data: savedNfse,
      };
    } catch (error) {
      this.logger.error('Error creating RPS:', error.message);
      return {
        success: false,
        newStatus: NfseStatus.DRAFT,
        message: `Error creating RPS: ${error.message}`,
      };
    }
  }

  /**
   * Step 2: Validate RPS before sending
   * Business rules validation
   */
  async validateRps(nfseId: string): Promise<NfseWorkflowResult> {
    try {
      this.logger.log(`Validating RPS ${nfseId}...`);

      const nfse = await this.nfseRepository.findOne({
        where: { id: nfseId },
      });

      if (!nfse) {
        return {
          success: false,
          newStatus: NfseStatus.DRAFT,
          message: 'NFS-e not found',
        };
      }

      // Business validation rules
      const validationErrors = await this.validateBusinessRules(nfse);
      if (validationErrors.length > 0) {
        return {
          success: false,
          newStatus: NfseStatus.DRAFT,
          message: `Validation errors: ${validationErrors.join(', ')}`,
        };
      }

      // Update status to validated
      await this.nfseRepository.update(nfseId, {
        status: NfseStatus.VALIDATED,
      });

      return {
        success: true,
        newStatus: NfseStatus.VALIDATED,
        message: 'RPS validated successfully',
      };
    } catch (error) {
      this.logger.error('Error validating RPS:', error.message);
      return {
        success: false,
        newStatus: NfseStatus.DRAFT,
        message: `Error validating RPS: ${error.message}`,
      };
    }
  }

  /**
   * Step 3: Send RPS to webservice
   * This is where we actually send to municipality
   */
  async sendRpsToWebservice(nfseId: string): Promise<NfseWorkflowResult> {
    try {
      this.logger.log(`Sending RPS ${nfseId} to webservice...`);

      const nfse = await this.nfseRepository.findOne({
        where: { id: nfseId },
      });

      if (!nfse) {
        return {
          success: false,
          newStatus: NfseStatus.VALIDATED,
          message: 'NFS-e not found',
        };
      }

      if (nfse.status !== NfseStatus.VALIDATED) {
        return {
          success: false,
          newStatus: nfse.status,
          message: 'RPS must be validated before sending',
        };
      }

      // Update status to sending
      await this.nfseRepository.update(nfseId, {
        status: NfseStatus.SENDING,
      });

      // Generate XML
      const xml = await this.xmlSigningService.generateNfseXml(nfse);

      // Sign XML
      const signedXml = await this.xmlSigningService.signXml(xml);

      // Send to webservice with retry
      const retryResult = await this.retryService.executeWebserviceWithRetry(
        async () => {
          return await this.webService.sendNfse(signedXml);
        }
      );

      if (!retryResult.success) {
        await this.nfseRepository.update(nfseId, {
          status: NfseStatus.SEND_ERROR,
        });
        return {
          success: false,
          newStatus: NfseStatus.SEND_ERROR,
          message: `Webservice error after ${retryResult.attempts} attempts: ${retryResult.error}`,
        };
      }

      const response = retryResult.result;

      if (response.success) {
        // Update with webservice response
        await this.nfseRepository.update(nfseId, {
          status: NfseStatus.SENT,
          nfseNumber: response.nfseNumber,
          nfseDate: response.nfseDate,
          verificationCode: response.nfseCode,
          nfseLink: response.nfseLink,
        });

        return {
          success: true,
          newStatus: NfseStatus.SENT,
          message: 'RPS sent successfully',
          data: response,
        };
      } else {
        // Handle webservice error
        await this.nfseRepository.update(nfseId, {
          status: NfseStatus.SEND_ERROR,
        });

        return {
          success: false,
          newStatus: NfseStatus.SEND_ERROR,
          message: `Webservice error: ${response.observations}`,
        };
      }
    } catch (error) {
      this.logger.error('Error sending RPS to webservice:', error.message);

      await this.nfseRepository.update(nfseId, {
        status: NfseStatus.SEND_ERROR,
      });

      return {
        success: false,
        newStatus: NfseStatus.SEND_ERROR,
        message: `Error sending RPS: ${error.message}`,
      };
    }
  }

  /**
   * Step 4: Check processing status
   * This is called periodically to check if municipality processed the RPS
   */
  async checkProcessingStatus(nfseId: string): Promise<NfseWorkflowResult> {
    try {
      this.logger.log(`Checking processing status for NFS-e ${nfseId}...`);

      const nfse = await this.nfseRepository.findOne({
        where: { id: nfseId },
      });

      if (!nfse || !nfse.nfseNumber) {
        return {
          success: false,
          newStatus: nfse?.status || NfseStatus.SENT,
          message: 'NFS-e not found or not sent yet',
        };
      }

      // Consult webservice for status
      const statusResponse = await this.webService.consultNfseStatus(
        nfse.nfseNumber
      );

      // Update status based on response
      let newStatus: NfseStatus;
      let message: string;

      switch (statusResponse.status) {
        case 'PROCESSING':
          newStatus = NfseStatus.PROCESSING;
          message = 'NFS-e is being processed by municipality';
          break;
        case 'APPROVED':
          newStatus = NfseStatus.APPROVED;
          message = 'NFS-e approved by municipality';
          break;
        case 'REJECTED':
          newStatus = NfseStatus.REJECTED;
          message = 'NFS-e rejected by municipality';
          break;
        default:
          newStatus = NfseStatus.PROCESSING;
          message = 'Unknown status from municipality';
      }

      await this.nfseRepository.update(nfseId, {
        status: newStatus,
      });

      return {
        success: true,
        newStatus,
        message,
        data: statusResponse,
      };
    } catch (error) {
      this.logger.error('Error checking processing status:', error.message);
      return {
        success: false,
        newStatus: NfseStatus.PROCESSING_ERROR,
        message: `Error checking status: ${error.message}`,
      };
    }
  }

  /**
   * Cancel NFS-e (only possible in certain states)
   */
  async cancelNfse(
    nfseId: string,
    reason: string
  ): Promise<NfseWorkflowResult> {
    try {
      this.logger.log(`Cancelling NFS-e ${nfseId}...`);

      const nfse = await this.nfseRepository.findOne({
        where: { id: nfseId },
      });

      if (!nfse) {
        return {
          success: false,
          newStatus: NfseStatus.CANCELLED,
          message: 'NFS-e not found',
        };
      }

      // Only allow cancellation in certain states
      const cancellableStates = [
        NfseStatus.DRAFT,
        NfseStatus.VALIDATED,
        NfseStatus.SENT,
        NfseStatus.PROCESSING,
        NfseStatus.SEND_ERROR,
        NfseStatus.REJECTED,
      ];

      if (!cancellableStates.includes(nfse.status)) {
        return {
          success: false,
          newStatus: nfse.status,
          message: `Cannot cancel NFS-e in status: ${nfse.status}`,
        };
      }

      // If already sent to webservice, need to cancel there too
      if (
        nfse.status === NfseStatus.SENT ||
        nfse.status === NfseStatus.PROCESSING
      ) {
        const cancelResponse = await this.webService.cancelNfse(
          `<CancelamentoNfse><IdentificacaoNfse>${nfse.nfseNumber}</IdentificacaoNfse><CodigoCancelamento>1</CodigoCancelamento><Justificativa>${reason}</Justificativa></CancelamentoNfse>`
        );

        if (!cancelResponse.success) {
          return {
            success: false,
            newStatus: nfse.status,
            message: `Error cancelling in webservice: ${cancelResponse.observations}`,
          };
        }
      }

      await this.nfseRepository.update(nfseId, {
        status: NfseStatus.CANCELLED,
      });

      return {
        success: true,
        newStatus: NfseStatus.CANCELLED,
        message: 'NFS-e cancelled successfully',
      };
    } catch (error) {
      this.logger.error('Error cancelling NFS-e:', error.message);
      return {
        success: false,
        newStatus: NfseStatus.CANCELLED,
        message: `Error cancelling NFS-e: ${error.message}`,
      };
    }
  }

  /**
   * Business rules validation
   */
  private async validateBusinessRules(nfse: Nfse): Promise<string[]> {
    const errors: string[] = [];

    // Example validation rules
    if (!nfse.serviceDescription) {
      errors.push('Service description is required');
    }

    if (!nfse.serviceValue || nfse.serviceValue <= 0) {
      errors.push('Service value must be greater than 0');
    }

    if (!nfse.providerCnpj) {
      errors.push('Provider CNPJ is required');
    }

    if (!nfse.recipientName) {
      errors.push('Recipient name is required');
    }

    // Add more business rules as needed

    return errors;
  }

  /**
   * Generate unique RPS number
   */
  private generateRpsNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `RPS${timestamp}${random}`;
  }
}
