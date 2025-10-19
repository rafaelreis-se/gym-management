import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nfse } from '@gym-management/domain';
import { NfseStatus } from '@gym-management/types';
import { CreateNfseDto, UpdateNfseDto } from './dto';
import { NfseWebService } from './services/nfse-webservice.service';
import { XmlSigningService } from './services/xml-signing.service';

@Injectable()
export class NfseService {
  constructor(
    @InjectRepository(Nfse)
    private readonly nfseRepository: Repository<Nfse>,
    private readonly webService: NfseWebService,
    private readonly xmlSigningService: XmlSigningService
  ) {}

  async create(createNfseDto: CreateNfseDto): Promise<Nfse> {
    // Check if NFS-e number already exists
    const existingNfse = await this.nfseRepository.findOne({
      where: { number: createNfseDto.number, series: createNfseDto.series },
    });

    if (existingNfse) {
      throw new BadRequestException(
        `NFS-e number ${createNfseDto.number} already exists in series ${createNfseDto.series}`
      );
    }

    // Create new NFS-e
    const nfse = this.nfseRepository.create({
      ...createNfseDto,
      emissionDate: new Date(createNfseDto.emissionDate),
      status: NfseStatus.PENDING,
    });

    return await this.nfseRepository.save(nfse);
  }

  async findAll(): Promise<Nfse[]> {
    return await this.nfseRepository.find({
      relations: ['student'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Nfse> {
    const nfse = await this.nfseRepository.findOne({
      where: { id },
      relations: ['student'],
    });

    if (!nfse) {
      throw new NotFoundException(`NFS-e with ID ${id} not found`);
    }

    return nfse;
  }

  async findByNumber(number: number, series: string): Promise<Nfse> {
    const nfse = await this.nfseRepository.findOne({
      where: { number, series },
      relations: ['student'],
    });

    if (!nfse) {
      throw new NotFoundException(`NFS-e ${number}/${series} not found`);
    }

    return nfse;
  }

  async update(id: string, updateNfseDto: UpdateNfseDto): Promise<Nfse> {
    const nfse = await this.findOne(id);

    // Prevent updating sent or processed NFS-e
    if (
      nfse.status !== NfseStatus.PENDING &&
      nfse.status !== NfseStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Cannot update NFS-e that has been sent or processed'
      );
    }

    Object.assign(nfse, updateNfseDto);

    if (updateNfseDto.emissionDate) {
      nfse.emissionDate = new Date(updateNfseDto.emissionDate);
    }

    return await this.nfseRepository.save(nfse);
  }

  async remove(id: string): Promise<void> {
    const nfse = await this.findOne(id);

    // Prevent deleting sent or processed NFS-e
    if (
      nfse.status !== NfseStatus.PENDING &&
      nfse.status !== NfseStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Cannot delete NFS-e that has been sent or processed'
      );
    }

    await this.nfseRepository.remove(nfse);
  }

  async sendNfse(
    nfseIds: string[]
  ): Promise<{ sent: number; failed: number; errors: any[] }> {
    const results = {
      sent: 0,
      failed: 0,
      errors: [] as any[],
    };

    for (const id of nfseIds) {
      try {
        const nfse = await this.findOne(id);

        if (nfse.status !== NfseStatus.PENDING) {
          results.errors.push({
            nfseId: id,
            error: 'NFS-e is not in pending status',
          });
          results.failed++;
          continue;
        }

        // Generate XML and send to webservice
        const xml = await this.generateNfseXml(nfse);
        const signedXml = await this.xmlSigningService.signXml(xml);
        const response = await this.webService.sendNfse(signedXml);

        if (response.success) {
          nfse.status = NfseStatus.SENT;
          nfse.protocol = response.protocol;
          nfse.sentDate = new Date();
          nfse.nfseNumber = response.nfseNumber;
          nfse.nfseCode = response.nfseCode;
          nfse.nfseLink = response.nfseLink;
          nfse.nfseDate = response.nfseDate;
          await this.nfseRepository.save(nfse);
          results.sent++;
        } else {
          nfse.status = NfseStatus.REJECTED;
          nfse.observations = response.observations;
          await this.nfseRepository.save(nfse);
          results.errors.push({
            nfseId: id,
            error: response.observations,
          });
          results.failed++;
        }
      } catch (error) {
        results.errors.push({
          nfseId: id,
          error: error.message,
        });
        results.failed++;
      }
    }

    return results;
  }

  async cancelNfse(nfseId: string, reason: string): Promise<Nfse> {
    const nfse = await this.findOne(nfseId);

    if (nfse.status === NfseStatus.CANCELLED) {
      throw new BadRequestException('NFS-e is already cancelled');
    }

    if (
      nfse.status === NfseStatus.PENDING ||
      nfse.status === NfseStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Cannot cancel NFS-e that has not been approved'
      );
    }

    // Generate cancellation XML and send to webservice
    const xml = await this.generateCancellationXml(nfse, reason);
    const signedXml = await this.xmlSigningService.signXml(xml);
    const response = await this.webService.cancelNfse(signedXml);

    if (response.success) {
      nfse.status = NfseStatus.CANCELLED;
      nfse.observations = `Cancelled: ${reason}`;
      await this.nfseRepository.save(nfse);
    } else {
      throw new BadRequestException(
        `Failed to cancel NFS-e: ${response.observations}`
      );
    }

    return nfse;
  }

  async consultNfseStatus(nfseId: string): Promise<any> {
    const nfse = await this.findOne(nfseId);

    if (!nfse.nfseNumber) {
      throw new BadRequestException('NFS-e has not been sent yet');
    }

    const status = await this.webService.consultNfseStatus(nfse.nfseNumber);

    // Update NFS-e with current status if it has changed
    if (status.status !== nfse.status) {
      nfse.status = status.status as NfseStatus;
      if (status.processedDate) {
        nfse.processedDate = status.processedDate;
      }
      await this.nfseRepository.save(nfse);
    }

    return status;
  }

  private async generateNfseXml(nfse: Nfse): Promise<string> {
    // This method will be implemented with the actual XML generation
    // following Araxá's NFS-e format
    throw new Error('XML generation not implemented yet');
  }

  private async generateCancellationXml(
    nfse: Nfse,
    reason: string
  ): Promise<string> {
    // This method will be implemented with the actual cancellation XML generation
    throw new Error('Cancellation XML generation not implemented yet');
  }
}
