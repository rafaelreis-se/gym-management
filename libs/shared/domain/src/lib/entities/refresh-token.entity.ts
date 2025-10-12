import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

/**
 * Refresh token entity for JWT token rotation
 */
@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, (user) => user.refreshTokens)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ length: 500, unique: true })
  token: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'boolean', default: false })
  isRevoked: boolean;

  @Column({ length: 100, nullable: true })
  userAgent: string;

  @Column({ length: 45, nullable: true })
  ipAddress: string;

  @CreateDateColumn()
  createdAt: Date;
}

