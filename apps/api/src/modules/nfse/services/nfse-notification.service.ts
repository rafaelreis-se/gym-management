import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nfse } from '@gym-management/domain';
import { NfseStatus } from '@gym-management/types';
import { EmailService } from './email.service';
import { RetryService } from './retry.service';

export interface EmailNotification {
  to: string;
  subject: string;
  template: string;
  data: any;
}

/**
 * Service responsible for NFS-e email notifications
 * Handles both automatic notifications and manual sending
 */
@Injectable()
export class NfseNotificationService {
  private readonly logger = new Logger(NfseNotificationService.name);

  constructor(
    @InjectRepository(Nfse)
    private readonly nfseRepository: Repository<Nfse>,
    private readonly emailService: EmailService,
    private readonly retryService: RetryService
  ) {}

  /**
   * Send notification when NFS-e status changes
   */
  async notifyStatusChange(
    nfseId: string,
    newStatus: NfseStatus
  ): Promise<void> {
    try {
      this.logger.log(`Sending status change notification for NFS-e ${nfseId}`);

      const nfse = await this.nfseRepository.findOne({
        where: { id: nfseId },
        relations: ['student'], // If linked to a student
      });

      if (!nfse) {
        this.logger.warn(`NFS-e ${nfseId} not found for notification`);
        return;
      }

      // Determine notification type based on status
      const notification = await this.createStatusNotification(nfse, newStatus);

      if (notification) {
        await this.sendNotification(notification);
        this.logger.log(
          `Notification sent for NFS-e ${nfseId} - Status: ${newStatus}`
        );
      }
    } catch (error) {
      this.logger.error(
        `Error sending notification for NFS-e ${nfseId}:`,
        error.message
      );
    }
  }

  /**
   * Send NFS-e to customer via email
   * This is what most companies do - they send the NFS-e to the customer
   */
  async sendNfseToCustomer(nfseId: string): Promise<boolean> {
    try {
      this.logger.log(`Sending NFS-e ${nfseId} to customer via email`);

      const nfse = await this.nfseRepository.findOne({
        where: { id: nfseId },
        relations: ['student'],
      });

      if (!nfse) {
        this.logger.warn(`NFS-e ${nfseId} not found`);
        return false;
      }

      if (nfse.status !== NfseStatus.APPROVED) {
        this.logger.warn(
          `Cannot send NFS-e ${nfseId} - Status is not approved: ${nfse.status}`
        );
        return false;
      }

      // Get customer email
      const customerEmail = this.getCustomerEmail(nfse);
      if (!customerEmail) {
        this.logger.warn(`No customer email found for NFS-e ${nfseId}`);
        return false;
      }

      // Create email notification
      const notification: EmailNotification = {
        to: customerEmail,
        subject: `NFS-e ${nfse.nfseNumber} - ${nfse.serviceDescription}`,
        template: 'nfse-customer',
        data: {
          nfse,
          customerName: nfse.recipientName,
          serviceDescription: nfse.serviceDescription,
          serviceAmount: nfse.serviceValue,
          nfseLink: nfse.nfseLink,
          verificationCode: nfse.verificationCode,
        },
      };

      await this.sendNotification(notification);
      this.logger.log(`NFS-e ${nfseId} sent to customer: ${customerEmail}`);

      return true;
    } catch (error) {
      this.logger.error(
        `Error sending NFS-e ${nfseId} to customer:`,
        error.message
      );
      return false;
    }
  }

  /**
   * Send batch notifications for multiple NFS-e
   */
  async sendBatchNotifications(nfseIds: string[]): Promise<void> {
    this.logger.log(`Sending batch notifications for ${nfseIds.length} NFS-e`);

    const promises = nfseIds.map((id) => this.sendNfseToCustomer(id));
    const results = await Promise.allSettled(promises);

    const successful = results.filter(
      (r) => r.status === 'fulfilled' && r.value
    ).length;
    const failed = results.length - successful;

    this.logger.log(
      `Batch notification completed: ${successful} successful, ${failed} failed`
    );
  }

  /**
   * Create status change notification
   */
  private async createStatusNotification(
    nfse: Nfse,
    newStatus: NfseStatus
  ): Promise<EmailNotification | null> {
    const customerEmail = this.getCustomerEmail(nfse);
    if (!customerEmail) {
      return null;
    }

    const statusMessages = {
      [NfseStatus.SENT]: {
        subject: `NFS-e ${nfse.number} sent for processing`,
        template: 'nfse-sent',
        message: 'Your NFS-e has been sent for processing to the municipality.',
      },
      [NfseStatus.APPROVED]: {
        subject: `NFS-e ${nfse.nfseNumber} approved`,
        template: 'nfse-approved',
        message: 'Your NFS-e has been approved and is available for download.',
      },
      [NfseStatus.REJECTED]: {
        subject: `NFS-e ${nfse.number} rejected`,
        template: 'nfse-rejected',
        message:
          'Your NFS-e was rejected by the municipality. Please contact us.',
      },
      [NfseStatus.CANCELLED]: {
        subject: `NFS-e ${nfse.number} cancelled`,
        template: 'nfse-cancelled',
        message: 'Your NFS-e has been cancelled.',
      },
    };

    const statusInfo = statusMessages[newStatus];
    if (!statusInfo) {
      return null; // No notification for this status
    }

    return {
      to: customerEmail,
      subject: statusInfo.subject,
      template: statusInfo.template,
      data: {
        nfse,
        customerName: nfse.recipientName,
        status: newStatus,
        message: statusInfo.message,
        nfseLink: nfse.nfseLink,
        verificationCode: nfse.verificationCode,
      },
    };
  }

  /**
   * Get customer email from NFS-e data
   */
  private getCustomerEmail(nfse: Nfse): string | null {
    // In a real implementation, you might have an email field in the taker data
    // For now, we'll use a placeholder or extract from taker data

    // Option 1: If linked to a student, use student email
    if (nfse.student?.email) {
      return nfse.student.email;
    }

    // Option 2: If you have email in taker data
    // return nfse.takerEmail;

    // Option 3: For now, return null (you'll need to add email field to your DTO)
    return null;
  }

  /**
   * Send notification via email service with retry
   */
  private async sendNotification(
    notification: EmailNotification
  ): Promise<void> {
    const result = await this.retryService.executeEmailWithRetry(async () => {
      this.logger.log(`Sending email notification to ${notification.to}`);
      this.logger.log(`Subject: ${notification.subject}`);
      this.logger.log(`Template: ${notification.template}`);

      return await this.emailService.sendTemplate(
        notification.to,
        notification.template,
        notification.data
      );
    });

    if (!result.success) {
      this.logger.error(
        'Failed to send email notification after retries:',
        result.error
      );
      throw new Error(`Email notification failed: ${result.error}`);
    }

    this.logger.log(
      `Email notification sent successfully (attempts: ${result.attempts})`
    );
  }

  /**
   * Send reminder for pending NFS-e
   */
  async sendReminderForPendingNfse(nfseId: string): Promise<void> {
    try {
      const nfse = await this.nfseRepository.findOne({
        where: { id: nfseId },
      });

      if (!nfse || nfse.status !== NfseStatus.SENT) {
        return;
      }

      const customerEmail = this.getCustomerEmail(nfse);
      if (!customerEmail) {
        return;
      }

      const notification: EmailNotification = {
        to: customerEmail,
        subject: `Reminder: NFS-e ${nfse.number} processing`,
        template: 'nfse-reminder',
        data: {
          nfse,
          customerName: nfse.recipientName,
          daysSinceSent: Math.floor(
            (Date.now() - nfse.emissionDate.getTime()) / (1000 * 60 * 60 * 24)
          ),
        },
      };

      await this.sendNotification(notification);
      this.logger.log(`Reminder sent for NFS-e ${nfseId}`);
    } catch (error) {
      this.logger.error(
        `Error sending reminder for NFS-e ${nfseId}:`,
        error.message
      );
    }
  }
}
