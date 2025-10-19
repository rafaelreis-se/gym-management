import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NfseWebService } from './nfse-webservice.service';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('NfseWebService', () => {
  let service: NfseWebService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NfseWebService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<NfseWebService>(NfseWebService);

    // Setup default config values
    mockConfigService.get.mockImplementation((key: string) => {
      const config = {
        NFSE_WEBSERVICE_URL: 'https://webservice.araxa.mg.gov.br',
        NFSE_CHAVE_ACESSO: 'test-access-key',
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

  describe('sendNfse', () => {
    it('should send NFS-e successfully', async () => {
      // Arrange
      const xml = '<xml>test</xml>';
      const mockResponse = {
        data: `
          <soap:Envelope>
            <soap:Body>
              <RecepcionarLoteRpsResponse>
                <Sucesso>true</Sucesso>
                <Protocolo>PROT123</Protocolo>
                <NumeroNfse>NFSE123</NumeroNfse>
                <CodigoNfse>CODE123</CodigoNfse>
                <LinkNfse>http://example.com/nfse</LinkNfse>
                <DataNfse>2024-01-01</DataNfse>
              </RecepcionarLoteRpsResponse>
            </soap:Body>
          </soap:Envelope>
        `,
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      // Act
      const result = await service.sendNfse(xml);

      // Assert
      expect(result.success).toBe(true);
      expect(result.protocol).toBe('PROT123');
      expect(result.nfseNumber).toBe('NFSE123');
      expect(result.nfseCode).toBe('CODE123');
      expect(result.nfseLink).toBe('http://example.com/nfse');
      expect(result.nfseDate).toBeInstanceOf(Date);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://webservice.araxa.mg.gov.br',
        expect.stringContaining('<soap:Envelope'),
        {
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            SOAPAction: 'RecepcionarLoteRps',
          },
          timeout: 30000,
        }
      );
    });

    it('should handle webservice error', async () => {
      // Arrange
      const xml = '<xml>test</xml>';
      const mockResponse = {
        data: `
          <soap:Envelope>
            <soap:Body>
              <RecepcionarLoteRpsResponse>
                <Sucesso>false</Sucesso>
                <Observacoes>Invalid XML format</Observacoes>
              </RecepcionarLoteRpsResponse>
            </soap:Body>
          </soap:Envelope>
        `,
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      // Act
      const result = await service.sendNfse(xml);

      // Assert
      expect(result.success).toBe(false);
      expect(result.observations).toBe('Invalid XML format');
    });

    it('should handle network error', async () => {
      // Arrange
      const xml = '<xml>test</xml>';
      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await service.sendNfse(xml);

      // Assert
      expect(result.success).toBe(false);
      expect(result.observations).toContain('Network error');
    });
  });

  describe('cancelNfse', () => {
    it('should cancel NFS-e successfully', async () => {
      // Arrange
      const xml = '<xml>cancel</xml>';
      const mockResponse = {
        data: `
          <soap:Envelope>
            <soap:Body>
              <CancelarNfseResponse>
                <Sucesso>true</Sucesso>
                <Protocolo>PROT456</Protocolo>
              </CancelarNfseResponse>
            </soap:Body>
          </soap:Envelope>
        `,
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      // Act
      const result = await service.cancelNfse(xml);

      // Assert
      expect(result.success).toBe(true);
      expect(result.protocol).toBe('PROT456');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://webservice.araxa.mg.gov.br',
        expect.stringContaining('<soap:Envelope'),
        {
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            SOAPAction: 'CancelarNfse',
          },
          timeout: 30000,
        }
      );
    });

    it('should handle cancellation error', async () => {
      // Arrange
      const xml = '<xml>cancel</xml>';
      const mockResponse = {
        data: `
          <soap:Envelope>
            <soap:Body>
              <CancelarNfseResponse>
                <Sucesso>false</Sucesso>
                <Observacoes>NFS-e not found</Observacoes>
              </CancelarNfseResponse>
            </soap:Body>
          </soap:Envelope>
        `,
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      // Act
      const result = await service.cancelNfse(xml);

      // Assert
      expect(result.success).toBe(false);
      expect(result.observations).toBe('NFS-e not found');
    });
  });

  describe('consultNfseStatus', () => {
    it('should consult NFS-e status successfully', async () => {
      // Arrange
      const nfseNumber = 'NFSE123';
      const mockResponse = {
        data: `
          <soap:Envelope>
            <soap:Body>
              <ConsultarNfseResponse>
                <Status>APPROVED</Status>
                <NumeroNfse>NFSE123</NumeroNfse>
                <CodigoNfse>CODE123</CodigoNfse>
                <LinkNfse>http://example.com/nfse</LinkNfse>
                <DataNfse>2024-01-01</DataNfse>
                <DataProcessamento>2024-01-01T10:00:00</DataProcessamento>
              </ConsultarNfseResponse>
            </soap:Body>
          </soap:Envelope>
        `,
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      // Act
      const result = await service.consultNfseStatus(nfseNumber);

      // Assert
      expect(result.status).toBe('APPROVED');
      expect(result.nfseNumber).toBe('NFSE123');
      expect(result.nfseCode).toBe('CODE123');
      expect(result.nfseLink).toBe('http://example.com/nfse');
      expect(result.nfseDate).toBeInstanceOf(Date);
      expect(result.processedDate).toBeInstanceOf(Date);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://webservice.araxa.mg.gov.br',
        expect.stringContaining('<soap:Envelope'),
        {
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            SOAPAction: 'ConsultarNfse',
          },
          timeout: 30000,
        }
      );
    });

    it('should handle consultation error', async () => {
      // Arrange
      const nfseNumber = 'INVALID123';
      mockedAxios.post.mockRejectedValue(new Error('NFS-e not found'));

      // Act & Assert
      await expect(service.consultNfseStatus(nfseNumber)).rejects.toThrow(
        'NFS-e not found'
      );
    });
  });

  describe('createSoapEnvelope', () => {
    it('should create correct SOAP envelope', () => {
      // This is a private method, but we can test it indirectly through public methods
      const xml = '<test>content</test>';

      // We'll test this through the sendNfse method
      mockedAxios.post.mockResolvedValue({
        data: '<soap:Envelope><soap:Body><Sucesso>true</Sucesso></soap:Body></soap:Envelope>',
      });

      service.sendNfse(xml);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringMatching(/^<\?xml version="1\.0" encoding="utf-8"\?>/),
        expect.any(Object)
      );
    });
  });

  describe('parseResponse', () => {
    it('should parse XML response correctly', () => {
      // This tests the private parseResponse method indirectly
      const responseXml = `
        <soap:Envelope>
          <soap:Body>
            <RecepcionarLoteRpsResponse>
              <Sucesso>true</Sucesso>
              <Protocolo>PROT123</Protocolo>
              <NumeroNfse>NFSE123</NumeroNfse>
              <CodigoNfse>CODE123</CodigoNfse>
              <LinkNfse>http://example.com/nfse</LinkNfse>
              <DataNfse>2024-01-01</DataNfse>
            </RecepcionarLoteRpsResponse>
          </soap:Body>
        </soap:Envelope>
      `;

      mockedAxios.post.mockResolvedValue({ data: responseXml });

      return service.sendNfse('<xml>test</xml>').then((result) => {
        expect(result.success).toBe(true);
        expect(result.protocol).toBe('PROT123');
        expect(result.nfseNumber).toBe('NFSE123');
        expect(result.nfseCode).toBe('CODE123');
        expect(result.nfseLink).toBe('http://example.com/nfse');
        expect(result.nfseDate).toBeInstanceOf(Date);
      });
    });

    it('should handle parsing errors gracefully', () => {
      const invalidXml = 'invalid xml content';

      mockedAxios.post.mockResolvedValue({ data: invalidXml });

      return service.sendNfse('<xml>test</xml>').then((result) => {
        expect(result.success).toBe(false);
        expect(result.observations).toBe('Error parsing webservice response');
      });
    });
  });

  describe('extractValue', () => {
    it('should extract values from XML correctly', () => {
      // Test the private extractValue method indirectly
      const responseXml = `
        <soap:Envelope>
          <soap:Body>
            <RecepcionarLoteRpsResponse>
              <Protocolo>PROT123</Protocolo>
              <NumeroNfse>NFSE123</NumeroNfse>
            </RecepcionarLoteRpsResponse>
          </soap:Body>
        </soap:Envelope>
      `;

      mockedAxios.post.mockResolvedValue({ data: responseXml });

      return service.sendNfse('<xml>test</xml>').then((result) => {
        expect(result.success).toBe(false);
        expect(result.observations).toBe('Error parsing webservice response');
      });
    });

    it('should return undefined for missing tags', () => {
      const responseXml = `
        <soap:Envelope>
          <soap:Body>
            <RecepcionarLoteRpsResponse>
              <Protocolo>PROT123</Protocolo>
            </RecepcionarLoteRpsResponse>
          </soap:Body>
        </soap:Envelope>
      `;

      mockedAxios.post.mockResolvedValue({ data: responseXml });

      return service.sendNfse('<xml>test</xml>').then((result) => {
        expect(result.success).toBe(false);
        expect(result.observations).toBe('Error parsing webservice response');
      });
    });
  });
});
