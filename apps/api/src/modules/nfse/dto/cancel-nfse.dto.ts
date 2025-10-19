import { IsString, IsUUID } from 'class-validator';

export class CancelNfseDto {
  @IsUUID()
  nfseId: string;

  @IsString()
  reason: string;
}
