import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Student } from './student.entity';
import { NfseStatus } from '@gym-management/types';

/**
 * NFS-e (Electronic Service Invoice) entity
 * Represents electronic service invoices for the gym
 */
@Entity('nfse')
export class Nfse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', unique: true })
  number: number;

  @Column({ length: 5 })
  series: string;

  @Column({ type: 'int' })
  type: number; // 1 = RPS, 2 = Conjugated Invoice, 3 = Receipt

  @Column({ type: 'timestamp' })
  emissionDate: Date;

  @Column({
    type: 'enum',
    enum: NfseStatus,
    default: NfseStatus.PENDING,
  })
  status: NfseStatus;

  @Column({ type: 'int' })
  operationNature: number; // 1 = Municipal taxation, 2 = Non-municipal taxation, etc.

  @Column({ type: 'int', nullable: true })
  specialTaxRegime?: number;

  @Column({ type: 'boolean', default: true })
  simpleNationalOptant: boolean;

  @Column({ type: 'boolean', default: false })
  culturalIncentivizer: boolean;

  // Service Provider Information
  @Column({ length: 14 })
  providerCnpj: string;

  @Column({ length: 20 })
  providerMunicipalInscription: string;

  @Column({ length: 255 })
  providerBusinessName: string;

  @Column({ length: 255, nullable: true })
  providerTradeName?: string;

  // Service Recipient Information
  @Column({ length: 14, nullable: true })
  recipientCnpj?: string;

  @Column({ length: 11, nullable: true })
  recipientCpf?: string;

  @Column({ length: 20, nullable: true })
  recipientMunicipalInscription?: string;

  @Column({ length: 255 })
  recipientName: string;

  @Column({ length: 255, nullable: true })
  recipientEmail?: string;

  @Column({ length: 20, nullable: true })
  recipientPhone?: string;

  // Address Information
  @Column({ length: 255 })
  recipientStreet: string;

  @Column({ length: 10 })
  recipientNumber: string;

  @Column({ length: 255, nullable: true })
  recipientComplement?: string;

  @Column({ length: 100 })
  recipientDistrict: string;

  @Column({ length: 7 })
  recipientCityCode: string;

  @Column({ length: 2 })
  recipientState: string;

  @Column({ length: 8 })
  recipientZipCode: string;

  // Service Information
  @Column({ length: 10 })
  serviceCode: string;

  @Column({ type: 'text' })
  serviceDescription: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  taxRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  serviceValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  deductionValue?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  pisValue?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  cofinsValue?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  inssValue?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  irValue?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  csllValue?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  issValue?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  netValue: number;

  @Column({ type: 'boolean', default: false })
  issWithheld: boolean;

  @Column({ type: 'text' })
  serviceDiscrimination: string;

  @Column({ length: 7 })
  serviceCityCode: string;

  @Column({ length: 20, nullable: true })
  municipalTaxationCode?: string;

  // NFS-e Response Information
  @Column({ length: 50, nullable: true })
  verificationCode?: string;

  @Column({ length: 50, nullable: true })
  nfseNumber?: string;

  @Column({ length: 50, nullable: true })
  nfseCode?: string;

  @Column({ type: 'text', nullable: true })
  nfseLink?: string;

  @Column({ type: 'timestamp', nullable: true })
  nfseDate?: Date;

  @Column({ length: 100, nullable: true })
  protocol?: string;

  @Column({ type: 'timestamp', nullable: true })
  sentDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  processedDate?: Date;

  @Column({ type: 'text', nullable: true })
  observations?: string;

  // Relations
  @Column('uuid', { nullable: true })
  studentId: string;

  @ManyToOne(() => Student, { nullable: true })
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
