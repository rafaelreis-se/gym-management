import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FinancialService } from './financial.service';
import { PlansService } from './plans.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { MarkAsPaidDto } from './dto/mark-as-paid.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@gym-management/common';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('financial')
@ApiBearerAuth()
@Controller('financial')
export class FinancialController {
  constructor(
    private readonly financialService: FinancialService,
    private readonly plansService: PlansService
  ) {}

  // Payments endpoints
  @Post('payments')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.financialService.create(createPaymentDto);
  }

  @Get('payments')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  findAllPayments() {
    return this.financialService.findAll();
  }

  @Get('payments/pending')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findPendingPayments() {
    return this.financialService.findPendingPayments();
  }

  @Get('payments/overdue')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findOverduePayments() {
    return this.financialService.findOverdue();
  }

  @Get('payments/:id')
  findOnePayment(@Param('id') id: string) {
    return this.financialService.findOne(id);
  }

  @Get('payments/enrollment/:enrollmentId')
  findPaymentsByEnrollment(@Param('enrollmentId') enrollmentId: string) {
    return this.financialService.findByEnrollment(enrollmentId);
  }

  @Patch('payments/:id')
  updatePayment(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto
  ) {
    return this.financialService.update(id, updatePaymentDto);
  }

  @Patch('payments/:id/mark-as-paid')
  markAsPaid(@Param('id') id: string, @Body() markAsPaidDto: MarkAsPaidDto) {
    return this.financialService.markAsPaid(
      id,
      markAsPaidDto.paymentDate,
      markAsPaidDto.paymentMethod
    );
  }

  @Delete('payments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removePayment(@Param('id') id: string) {
    return this.financialService.remove(id);
  }

  // Plans endpoints
  @Post('plans')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  createPlan(@Body() createPlanDto: CreatePlanDto) {
    return this.plansService.create(createPlanDto);
  }

  @Get('plans')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAllPlans() {
    return this.plansService.findAll();
  }

  @Public()
  @Get('plans/active')
  findActivePlans() {
    return this.plansService.findActive();
  }

  @Get('plans/:id')
  findOnePlan(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }

  @Patch('plans/:id')
  updatePlan(@Param('id') id: string, @Body() updatePlanDto: UpdatePlanDto) {
    return this.plansService.update(id, updatePlanDto);
  }

  @Delete('plans/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removePlan(@Param('id') id: string) {
    return this.plansService.remove(id);
  }
}

