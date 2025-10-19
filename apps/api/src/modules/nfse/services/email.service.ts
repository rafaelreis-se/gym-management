import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailData {
  to: string;
  subject: string;
  template: EmailTemplate;
  data?: Record<string, any>;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Email Service with Anti-Corruption Layer
 * This service abstracts email sending and can work with different providers
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly emailProvider: string;

  constructor(private readonly configService: ConfigService) {
    this.emailProvider = this.configService.get<string>('EMAIL_PROVIDER', 'console');
  }

  /**
   * Send email using configured provider
   */
  async sendEmail(emailData: EmailData): Promise<EmailResult> {
    try {
      this.logger.log(`Sending email to ${emailData.to} using ${this.emailProvider} provider`);

      switch (this.emailProvider) {
        case 'sendgrid':
          return await this.sendWithSendGrid(emailData);
        case 'ses':
          return await this.sendWithSES(emailData);
        case 'nodemailer':
          return await this.sendWithNodemailer(emailData);
        case 'console':
        default:
          return await this.sendToConsole(emailData);
      }
    } catch (error) {
      this.logger.error('Error sending email:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send email template
   */
  async sendTemplate(
    to: string,
    templateName: string,
    data: Record<string, any>,
    attachments?: EmailAttachment[]
  ): Promise<EmailResult> {
    const template = await this.getTemplate(templateName);
    const renderedTemplate = this.renderTemplate(template, data);

    return await this.sendEmail({
      to,
      subject: renderedTemplate.subject,
      template: renderedTemplate,
      data,
      attachments,
    });
  }

  /**
   * Get email template by name
   */
  private async getTemplate(templateName: string): Promise<EmailTemplate> {
    const templates = {
      'nfse-customer': {
        subject: 'Your NFS-e {{nfseNumber}} - {{serviceDescription}}',
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Your NFS-e is Ready!</h2>
              <p>Hello {{customerName}},</p>
              <p>Your NFS-e <strong>{{nfseNumber}}</strong> has been approved and is ready for download.</p>
              
              <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
                <h3>Service Details:</h3>
                <p><strong>Description:</strong> {{serviceDescription}}</p>
                <p><strong>Amount:</strong> R$ {{serviceAmount}}</p>
                <p><strong>Verification Code:</strong> {{verificationCode}}</p>
              </div>
              
              {{#if nfseLink}}
              <p><a href="{{nfseLink}}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download NFS-e</a></p>
              {{/if}}
              
              <p>Thank you for choosing our services!</p>
              <p>Best regards,<br>Gym Management Team</p>
            </body>
          </html>
        `,
        text: `
          Hello {{customerName}},
          
          Your NFS-e {{nfseNumber}} has been approved and is ready for download.
          
          Service Details:
          - Description: {{serviceDescription}}
          - Amount: R$ {{serviceAmount}}
          - Verification Code: {{verificationCode}}
          
          {{#if nfseLink}}
          Download link: {{nfseLink}}
          {{/if}}
          
          Thank you for choosing our services!
          
          Best regards,
          Gym Management Team
        `,
      },
      'nfse-sent': {
        subject: 'NFS-e {{rpsNumber}} Sent for Processing',
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>NFS-e Sent for Processing</h2>
              <p>Hello {{customerName}},</p>
              <p>Your NFS-e <strong>{{rpsNumber}}</strong> has been sent to the municipality for processing.</p>
              <p>You will receive another email once it's approved.</p>
              <p>Thank you for your patience!</p>
            </body>
          </html>
        `,
        text: `
          Hello {{customerName}},
          
          Your NFS-e {{rpsNumber}} has been sent to the municipality for processing.
          You will receive another email once it's approved.
          
          Thank you for your patience!
        `,
      },
      'nfse-approved': {
        subject: 'NFS-e {{nfseNumber}} Approved',
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>NFS-e Approved!</h2>
              <p>Hello {{customerName}},</p>
              <p>Great news! Your NFS-e <strong>{{nfseNumber}}</strong> has been approved by the municipality.</p>
              {{#if nfseLink}}
              <p><a href="{{nfseLink}}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download NFS-e</a></p>
              {{/if}}
              <p>Thank you for choosing our services!</p>
            </body>
          </html>
        `,
        text: `
          Hello {{customerName}},
          
          Great news! Your NFS-e {{nfseNumber}} has been approved by the municipality.
          
          {{#if nfseLink}}
          Download link: {{nfseLink}}
          {{/if}}
          
          Thank you for choosing our services!
        `,
      },
      'nfse-rejected': {
        subject: 'NFS-e {{rpsNumber}} Rejected',
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>NFS-e Rejected</h2>
              <p>Hello {{customerName}},</p>
              <p>Unfortunately, your NFS-e <strong>{{rpsNumber}}</strong> was rejected by the municipality.</p>
              <p>Please contact us for more information and to resolve this issue.</p>
              <p>We apologize for any inconvenience.</p>
            </body>
          </html>
        `,
        text: `
          Hello {{customerName}},
          
          Unfortunately, your NFS-e {{rpsNumber}} was rejected by the municipality.
          Please contact us for more information and to resolve this issue.
          
          We apologize for any inconvenience.
        `,
      },
      'nfse-cancelled': {
        subject: 'NFS-e {{rpsNumber}} Cancelled',
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>NFS-e Cancelled</h2>
              <p>Hello {{customerName}},</p>
              <p>Your NFS-e <strong>{{rpsNumber}}</strong> has been cancelled.</p>
              <p>If you have any questions, please contact us.</p>
            </body>
          </html>
        `,
        text: `
          Hello {{customerName}},
          
          Your NFS-e {{rpsNumber}} has been cancelled.
          If you have any questions, please contact us.
        `,
      },
      'nfse-reminder': {
        subject: 'Reminder: NFS-e {{rpsNumber}} Processing',
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Processing Reminder</h2>
              <p>Hello {{customerName}},</p>
              <p>This is a reminder that your NFS-e <strong>{{rpsNumber}}</strong> is still being processed by the municipality.</p>
              <p>It has been {{daysSinceSent}} days since it was sent.</p>
              <p>You will receive an email once processing is complete.</p>
              <p>Thank you for your patience!</p>
            </body>
          </html>
        `,
        text: `
          Hello {{customerName}},
          
          This is a reminder that your NFS-e {{rpsNumber}} is still being processed by the municipality.
          It has been {{daysSinceSent}} days since it was sent.
          
          You will receive an email once processing is complete.
          Thank you for your patience!
        `,
      },
    };

    return templates[templateName] || templates['nfse-customer'];
  }

  /**
   * Render template with data
   */
  private renderTemplate(template: EmailTemplate, data: Record<string, any>): EmailTemplate {
    const renderString = (str: string): string => {
      return str.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
        const value = data[key.trim()];
        return value !== undefined ? String(value) : match;
      });
    };

    return {
      subject: renderString(template.subject),
      html: renderString(template.html),
      text: renderString(template.text),
    };
  }

  /**
   * Send with SendGrid (production)
   */
  private async sendWithSendGrid(emailData: EmailData): Promise<EmailResult> {
    // In a real implementation, you would use SendGrid SDK
    this.logger.log('Sending with SendGrid (not implemented)');
    return await this.sendToConsole(emailData);
  }

  /**
   * Send with AWS SES (production)
   */
  private async sendWithSES(emailData: EmailData): Promise<EmailResult> {
    // In a real implementation, you would use AWS SES SDK
    this.logger.log('Sending with AWS SES (not implemented)');
    return await this.sendToConsole(emailData);
  }

  /**
   * Send with Nodemailer (development)
   */
  private async sendWithNodemailer(emailData: EmailData): Promise<EmailResult> {
    // In a real implementation, you would use Nodemailer
    this.logger.log('Sending with Nodemailer (not implemented)');
    return await this.sendToConsole(emailData);
  }

  /**
   * Send to console (development/testing)
   */
  private async sendToConsole(emailData: EmailData): Promise<EmailResult> {
    this.logger.log('='.repeat(60));
    this.logger.log('EMAIL SENT (Console Mode)');
    this.logger.log('='.repeat(60));
    this.logger.log(`To: ${emailData.to}`);
    this.logger.log(`Subject: ${emailData.subject}`);
    this.logger.log('Content:');
    this.logger.log(emailData.template.text);
    this.logger.log('='.repeat(60));

    return {
      success: true,
      messageId: `console-${Date.now()}`,
    };
  }
}
