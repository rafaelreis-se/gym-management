import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);

    // Setup default config values
    mockConfigService.get.mockImplementation((key: string) => {
      const config = {
        EMAIL_PROVIDER: 'console',
      };
      return config[key];
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmail', () => {
    it('should send email using console provider', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        template: {
          subject: 'Test Subject',
          html: '<html><body>Test</body></html>',
          text: 'Test content',
        },
      };

      const result = await service.sendEmail(emailData);

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.messageId).toMatch(/^console-/);
    });

    it('should handle email sending errors', async () => {
      // Mock config to use non-existent provider
      mockConfigService.get.mockReturnValue('invalid-provider');

      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        template: {
          subject: 'Test Subject',
          html: '<html><body>Test</body></html>',
          text: 'Test content',
        },
      };

      const result = await service.sendEmail(emailData);

      expect(result.success).toBe(true); // Should fallback to console
    });
  });

  describe('sendTemplate', () => {
    it('should send email template', async () => {
      const result = await service.sendTemplate(
        'test@example.com',
        'nfse-customer',
        {
          customerName: 'João Silva',
          nfseNumber: '12345',
          serviceDescription: 'Jiu-Jitsu Classes',
          serviceAmount: 100.0,
          verificationCode: 'ABC123',
        }
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });

    it('should handle template rendering errors', async () => {
      const result = await service.sendTemplate(
        'test@example.com',
        'invalid-template',
        {}
      );

      expect(result.success).toBe(true); // Should fallback to default template
    });
  });

  describe('getTemplate', () => {
    it('should return nfse-customer template', async () => {
      const template = await service['getTemplate']('nfse-customer');

      expect(template).toBeDefined();
      expect(template.subject).toContain('{{nfseNumber}}');
      expect(template.html).toContain('{{customerName}}');
      expect(template.text).toContain('{{customerName}}');
    });

    it('should return nfse-sent template', async () => {
      const template = await service['getTemplate']('nfse-sent');

      expect(template).toBeDefined();
      expect(template.subject).toContain('{{rpsNumber}}');
      expect(template.html).toContain('Processing');
    });

    it('should return nfse-approved template', async () => {
      const template = await service['getTemplate']('nfse-approved');

      expect(template).toBeDefined();
      expect(template.subject).toContain('{{nfseNumber}}');
      expect(template.html).toContain('Approved');
    });

    it('should return nfse-rejected template', async () => {
      const template = await service['getTemplate']('nfse-rejected');

      expect(template).toBeDefined();
      expect(template.subject).toContain('{{rpsNumber}}');
      expect(template.html).toContain('Rejected');
    });

    it('should return nfse-cancelled template', async () => {
      const template = await service['getTemplate']('nfse-cancelled');

      expect(template).toBeDefined();
      expect(template.subject).toContain('{{rpsNumber}}');
      expect(template.html).toContain('Cancelled');
    });

    it('should return nfse-reminder template', async () => {
      const template = await service['getTemplate']('nfse-reminder');

      expect(template).toBeDefined();
      expect(template.subject).toContain('{{rpsNumber}}');
      expect(template.html).toContain('Reminder');
    });

    it('should return default template for invalid template name', async () => {
      const template = await service['getTemplate']('invalid-template');

      expect(template).toBeDefined();
      expect(template.subject).toContain('{{nfseNumber}}');
    });
  });

  describe('renderTemplate', () => {
    it('should render template with data', () => {
      const template = {
        subject: 'Hello {{name}}',
        html: '<p>Hello {{name}}, your amount is {{amount}}</p>',
        text: 'Hello {{name}}, your amount is {{amount}}',
      };

      const data = {
        name: 'João',
        amount: 100.0,
      };

      const result = service['renderTemplate'](template, data);

      expect(result.subject).toBe('Hello João');
      expect(result.html).toBe('<p>Hello João, your amount is 100</p>');
      expect(result.text).toBe('Hello João, your amount is 100');
    });

    it('should handle missing data gracefully', () => {
      const template = {
        subject: 'Hello {{name}}',
        html: '<p>Hello {{name}}</p>',
        text: 'Hello {{name}}',
      };

      const data = {};

      const result = service['renderTemplate'](template, data);

      expect(result.subject).toBe('Hello {{name}}');
      expect(result.html).toBe('<p>Hello {{name}}</p>');
      expect(result.text).toBe('Hello {{name}}');
    });
  });

  describe('sendToConsole', () => {
    it('should log email to console', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        template: {
          subject: 'Test Subject',
          html: '<html><body>Test</body></html>',
          text: 'Test content',
        },
      };

      const loggerSpy = jest
        .spyOn(service['logger'], 'log')
        .mockImplementation();

      const result = await service['sendToConsole'](emailData);

      expect(result.success).toBe(true);
      expect(result.messageId).toMatch(/^console-/);
      expect(loggerSpy).toHaveBeenCalled();

      loggerSpy.mockRestore();
    });
  });
});
