import { PartialType } from '@nestjs/mapped-types';
import { CreateNfseDto } from './create-nfse.dto';

export class UpdateNfseDto extends PartialType(CreateNfseDto) {}
