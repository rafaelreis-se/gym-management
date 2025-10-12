import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment, Plan } from '@gym-management/domain';
import { FinancialController } from './financial.controller';
import { FinancialService } from './financial.service';
import { PlansService } from './plans.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Plan])],
  controllers: [FinancialController],
  providers: [FinancialService, PlansService],
  exports: [FinancialService, PlansService],
})
export class FinancialModule {}

