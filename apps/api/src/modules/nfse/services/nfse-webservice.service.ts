import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';

export interface NfseResponse {
  success: boolean;
  protocol?: string;
  nfseNumber?: string;
  nfseCode?: string;
  nfseLink?: string;
  nfseDate?: Date;
  observations?: string;
  errors?: string[];
}

export interface NfseStatus {
  status: string;
  nfseNumber?: string;
  nfseCode?: string;
  nfseLink?: string;
  nfseDate?: Date;
  processedDate?: Date;
  observations?: string;
}

@Injectable()
export class NfseWebService {
  private readonly logger = new Logger(NfseWebService.name);
  private readonly webserviceUrl: string;
  private readonly chaveAcesso: string;

  constructor(private readonly configService: ConfigService) {
    this.webserviceUrl = this.configService.get<string>('NFSE_WEBSERVICE_URL');
    this.chaveAcesso = this.configService.get<string>('NFSE_CHAVE_ACESSO');

    if (!this.webserviceUrl || !this.chaveAcesso) {
      this.logger.warn('NFS-e webservice configuration is incomplete');
    }
  }

  async sendNfse(xml: string): Promise<NfseResponse> {
    try {
      this.logger.log('Sending NFS-e to webservice...');

      const soapEnvelope = this.createSoapEnvelope(xml, 'RecepcionarLoteRps');

      const response: AxiosResponse = await axios.post(
        this.webserviceUrl,
        soapEnvelope,
        {
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            SOAPAction: 'RecepcionarLoteRps',
          },
          timeout: 30000,
        }
      );

      return this.parseResponse(response.data);
    } catch (error) {
      this.logger.error('Error sending NFS-e:', error.message);
      return {
        success: false,
        observations: `Error sending NFS-e: ${error.message}`,
      };
    }
  }

  async cancelNfse(xml: string): Promise<NfseResponse> {
    try {
      this.logger.log('Cancelling NFS-e...');

      const soapEnvelope = this.createSoapEnvelope(xml, 'CancelarNfse');

      const response: AxiosResponse = await axios.post(
        this.webserviceUrl,
        soapEnvelope,
        {
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            SOAPAction: 'CancelarNfse',
          },
          timeout: 30000,
        }
      );

      return this.parseResponse(response.data);
    } catch (error) {
      this.logger.error('Error cancelling NFS-e:', error.message);
      return {
        success: false,
        observations: `Error cancelling NFS-e: ${error.message}`,
      };
    }
  }

  async consultNfseStatus(nfseNumber: string): Promise<NfseStatus> {
    try {
      this.logger.log(`Consulting NFS-e status for number: ${nfseNumber}`);

      const xml = this.createConsultXml(nfseNumber);
      const soapEnvelope = this.createSoapEnvelope(xml, 'ConsultarNfse');

      const response: AxiosResponse = await axios.post(
        this.webserviceUrl,
        soapEnvelope,
        {
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            SOAPAction: 'ConsultarNfse',
          },
          timeout: 30000,
        }
      );

      return this.parseStatusResponse(response.data);
    } catch (error) {
      this.logger.error('Error consulting NFS-e status:', error.message);
      throw new Error(`Error consulting NFS-e status: ${error.message}`);
    }
  }

  private createSoapEnvelope(xml: string, action: string): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <${action}>
      <xml>${this.escapeXml(xml)}</xml>
    </${action}>
  </soap:Body>
</soap:Envelope>`;
  }

  private createConsultXml(nfseNumber: string): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<tcConsultarNfse xmlns="http://www.abrasf.org.br/nfse.xsd">
  <tsNumNfse>${nfseNumber}</tsNumNfse>
</tcConsultarNfse>`;
  }

  private escapeXml(xml: string): string {
    return xml
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private parseResponse(responseXml: string): NfseResponse {
    // This method should parse the XML response from the webservice
    // For now, returning a basic structure
    // In a real implementation, you would use an XML parser like xml2js or fast-xml-parser

    try {
      // Basic parsing logic - this should be enhanced with proper XML parsing
      if (
        responseXml.includes('<Sucesso>true</Sucesso>') ||
        responseXml.includes('<sucesso>true</sucesso>')
      ) {
        return {
          success: true,
          protocol: this.extractValue(responseXml, 'Protocolo'),
          nfseNumber: this.extractValue(responseXml, 'NumeroNfse'),
          nfseCode: this.extractValue(responseXml, 'CodigoNfse'),
          nfseLink: this.extractValue(responseXml, 'LinkNfse'),
          nfseDate: this.extractDate(responseXml, 'DataNfse'),
        };
      } else if (
        responseXml.includes('<Sucesso>false</Sucesso>') ||
        responseXml.includes('<sucesso>false</sucesso>')
      ) {
        return {
          success: false,
          observations:
            this.extractValue(responseXml, 'Observacoes') || 'Unknown error',
        };
      } else {
        return {
          success: false,
          observations: 'Error parsing webservice response',
        };
      }
    } catch (error) {
      this.logger.error('Error parsing webservice response:', error.message);
      return {
        success: false,
        observations: 'Error parsing webservice response',
      };
    }
  }

  private parseStatusResponse(responseXml: string): NfseStatus {
    try {
      return {
        status: this.extractValue(responseXml, 'Status') || 'UNKNOWN',
        nfseNumber: this.extractValue(responseXml, 'NumeroNfse'),
        nfseCode: this.extractValue(responseXml, 'CodigoNfse'),
        nfseLink: this.extractValue(responseXml, 'LinkNfse'),
        nfseDate: this.extractDate(responseXml, 'DataNfse'),
        processedDate: this.extractDate(responseXml, 'DataProcessamento'),
        observations: this.extractValue(responseXml, 'Observacoes'),
      };
    } catch (error) {
      this.logger.error('Error parsing status response:', error.message);
      throw new Error('Error parsing status response');
    }
  }

  private extractValue(xml: string, tagName: string): string | undefined {
    const regex = new RegExp(`<${tagName}[^>]*>(.*?)</${tagName}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : undefined;
  }

  private extractDate(xml: string, tagName: string): Date | undefined {
    const value = this.extractValue(xml, tagName);
    return value ? new Date(value) : undefined;
  }
}
