import { IsArray, IsUUID } from 'class-validator';

export class SendNfseDto {
  @IsArray()
  @IsUUID('4', { each: true })
  nfseIds: string[];
}
