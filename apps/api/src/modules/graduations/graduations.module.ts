import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Graduation } from '@gym-management/domain';
import { GraduationsController } from './graduations.controller';
import { GraduationsService } from './graduations.service';

@Module({
  imports: [TypeOrmModule.forFeature([Graduation])],
  controllers: [GraduationsController],
  providers: [GraduationsService],
  exports: [GraduationsService],
})
export class GraduationsModule {}

