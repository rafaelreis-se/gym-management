import { Injectable } from '@nestjs/common';
import { Rps, RpsLote, Tomador, Servico } from '../../domain/entities';
import {
  CreateRpsDto,
  NfseResponseDto,
  NfseStatusDto,
  CancelNfseDto,
} from '../dto';
import { NfseWebService } from '../../infrastructure/webservice/nfse-webservice.service';
import { XmlSigningService } from '../../infrastructure/xml-signing/xml-signing.service';

export interface NfseConfig {
  prestador: {
    cnpj: string;
    inscricaoMunicipal: string;
    razaoSocial: string;
    nomeFantasia?: string;
  };
  webservice: {
    url: string;
    chaveAcesso: string;
  };
  certificado: {
    path: string;
    password: string;
  };
  environment: 'HOMOLOGATION' | 'PRODUCTION';
}

@Injectable()
export class NfseService {
  constructor(
    private readonly webService: NfseWebService,
    private readonly xmlSigningService: XmlSigningService
  ) {}

  async createRps(createRpsDto: CreateRpsDto): Promise<Rps> {
    // Validação dos dados
    this.validateRpsData(createRpsDto);

    // Criação da entidade RPS
    const rps: Rps = {
      numero: createRpsDto.numero,
      serie: createRpsDto.serie,
      tipo: createRpsDto.tipo,
      dataEmissao: new Date(createRpsDto.dataEmissao),
      status: 'NORMAL',
      naturezaOperacao: createRpsDto.naturezaOperacao,
      regimeEspecialTributacao: createRpsDto.regimeEspecialTributacao,
      optanteSimplesNacional: createRpsDto.optanteSimplesNacional,
      incentivadorCultural: createRpsDto.incentivadorCultural,
      tomador: createRpsDto.tomador,
      servico: createRpsDto.servico,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return rps;
  }

  async createLoteRps(rpsList: Rps[]): Promise<RpsLote> {
    if (!rpsList || rpsList.length === 0) {
      throw new Error('Lista de RPS não pode estar vazia');
    }

    const lote: RpsLote = {
      numero: Date.now(), // Número único baseado em timestamp
      quantidade: rpsList.length,
      rps: rpsList,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return lote;
  }

  async enviarLoteRps(
    lote: RpsLote,
    config: NfseConfig
  ): Promise<NfseResponseDto> {
    try {
      // Geração do XML do lote
      const xmlLote = await this.generateLoteXml(lote, config);

      // Assinatura do XML
      const xmlAssinado = await this.xmlSigningService.signXml(
        xmlLote,
        config.certificado
      );

      // Envio para o webservice
      const response = await this.webService.enviarLoteRps(
        xmlAssinado,
        config.webservice
      );

      // Atualização do status do lote
      lote.status = response.success ? 'SENT' : 'REJECTED';
      lote.protocolo = response.protocolo;
      lote.dataEnvio = new Date();

      return response;
    } catch (error) {
      lote.status = 'REJECTED';
      lote.observacoes = error.message;
      throw error;
    }
  }

  async consultarStatusNfse(
    numeroNfse: string,
    config: NfseConfig
  ): Promise<NfseStatusDto> {
    return await this.webService.consultarNfse(numeroNfse, config.webservice);
  }

  async cancelarNfse(
    cancelDto: CancelNfseDto,
    config: NfseConfig
  ): Promise<NfseResponseDto> {
    const xmlCancelamento = await this.generateCancelamentoXml(
      cancelDto,
      config
    );
    const xmlAssinado = await this.xmlSigningService.signXml(
      xmlCancelamento,
      config.certificado
    );

    return await this.webService.cancelarNfse(xmlAssinado, config.webservice);
  }

  private validateRpsData(createRpsDto: CreateRpsDto): void {
    // Validações específicas do RPS
    if (!createRpsDto.numero || createRpsDto.numero <= 0) {
      throw new Error('Número do RPS é obrigatório e deve ser maior que zero');
    }

    if (!createRpsDto.serie || createRpsDto.serie.trim() === '') {
      throw new Error('Série do RPS é obrigatória');
    }

    if (!createRpsDto.tomador || !createRpsDto.tomador.cnpjCpf) {
      throw new Error('Tomador e CPF/CNPJ são obrigatórios');
    }

    if (!createRpsDto.servico || createRpsDto.servico.valorServicos <= 0) {
      throw new Error('Serviço e valor dos serviços são obrigatórios');
    }
  }

  private async generateLoteXml(
    lote: RpsLote,
    config: NfseConfig
  ): Promise<string> {
    // Implementação da geração do XML conforme padrão de Araxá
    // Este método será implementado na infraestrutura
    throw new Error('Método generateLoteXml não implementado');
  }

  private async generateCancelamentoXml(
    cancelDto: CancelNfseDto,
    config: NfseConfig
  ): Promise<string> {
    // Implementação da geração do XML de cancelamento
    throw new Error('Método generateCancelamentoXml não implementado');
  }
}
