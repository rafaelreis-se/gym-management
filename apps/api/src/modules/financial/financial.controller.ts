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
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
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
import { Payment, Plan } from '@gym-management/domain';
import { ResponseMessage } from '../../common/interceptors/api-response.interceptor';
import {
  PaginationQueryDto,
  PaginatedResponse,
} from '../../common/pagination/pagination.utils';

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
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({ status: 201, description: 'Payment successfully created' })
  @ResponseMessage('Payment successfully created')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  createPayment(@Body() createPaymentDto: CreatePaymentDto): Promise<Payment> {
    return this.financialService.create(createPaymentDto);
  }

  @Get('payments')
  @ApiOperation({ summary: 'Get all payments with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Payments list successfully retrieved',
  })
  @ResponseMessage('Payments list successfully retrieved')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  findAllPayments(): Promise<Payment[]> {
    return this.financialService.findAll();
  }

  @Get('payments/pending')
  @ApiOperation({ summary: 'Get pending payments' })
  @ApiResponse({
    status: 200,
    description: 'Pending payments successfully retrieved',
  })
  @ResponseMessage('Pending payments successfully retrieved')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findPendingPayments(): Promise<Payment[]> {
    return this.financialService.findPendingPayments();
  }

  @Get('payments/overdue')
  @ApiOperation({ summary: 'Get overdue payments' })
  @ApiResponse({
    status: 200,
    description: 'Overdue payments successfully retrieved',
  })
  @ResponseMessage('Overdue payments successfully retrieved')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findOverduePayments(): Promise<Payment[]> {
    return this.financialService.findOverdue();
  }

  @Get('payments/:id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment successfully retrieved' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ResponseMessage('Payment successfully retrieved')
  findOnePayment(@Param('id') id: string): Promise<Payment> {
    return this.financialService.findOne(id);
  }

  @Get('payments/enrollment/:enrollmentId')
  @ApiOperation({ summary: 'Get payments by enrollment ID' })
  @ApiResponse({
    status: 200,
    description: 'Enrollment payments successfully retrieved',
  })
  @ResponseMessage('Enrollment payments successfully retrieved')
  findPaymentsByEnrollment(
    @Param('enrollmentId') enrollmentId: string
  ): Promise<Payment[]> {
    return this.financialService.findByEnrollment(enrollmentId);
  }

  @Patch('payments/:id')
  @ApiOperation({ summary: 'Update payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment successfully updated' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ResponseMessage('Payment successfully updated')
  updatePayment(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto
  ): Promise<Payment> {
    return this.financialService.update(id, updatePaymentDto);
  }

  @Patch('payments/:id/mark-as-paid')
  @ApiOperation({ summary: 'Mark payment as paid' })
  @ApiResponse({
    status: 200,
    description: 'Payment successfully marked as paid',
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ResponseMessage('Payment successfully marked as paid')
  markAsPaid(
    @Param('id') id: string,
    @Body() markAsPaidDto: MarkAsPaidDto
  ): Promise<Payment> {
    return this.financialService.markAsPaid(
      id,
      markAsPaidDto.paymentDate,
      markAsPaidDto.paymentMethod
    );
  }

  @Delete('payments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove payment by ID' })
  @ApiResponse({ status: 204, description: 'Payment successfully removed' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ResponseMessage('Payment successfully removed')
  removePayment(@Param('id') id: string): Promise<void> {
    return this.financialService.remove(id);
  }

  // Plans endpoints
  @Post('plans')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new plan' })
  @ApiResponse({ status: 201, description: 'Plan successfully created' })
  @ResponseMessage('Plan successfully created')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  createPlan(@Body() createPlanDto: CreatePlanDto): Promise<Plan> {
    return this.plansService.create(createPlanDto);
  }

  @Get('plans')
  @ApiOperation({ summary: 'Get all plans with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Plans list successfully retrieved',
  })
  @ResponseMessage('Plans list successfully retrieved')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAllPlans(): Promise<Plan[]> {
    return this.plansService.findAll();
  }

  @Public()
  @Get('plans/active')
  @ApiOperation({ summary: 'Get all active plans' })
  @ApiResponse({
    status: 200,
    description: 'Active plans successfully retrieved',
  })
  @ResponseMessage('Active plans successfully retrieved')
  findActivePlans(): Promise<Plan[]> {
    return this.plansService.findActive();
  }

  @Get('plans/:id')
  @ApiOperation({ summary: 'Get plan by ID' })
  @ApiResponse({ status: 200, description: 'Plan successfully retrieved' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  @ResponseMessage('Plan successfully retrieved')
  findOnePlan(@Param('id') id: string): Promise<Plan> {
    return this.plansService.findOne(id);
  }

  @Patch('plans/:id')
  @ApiOperation({ summary: 'Update plan by ID' })
  @ApiResponse({ status: 200, description: 'Plan successfully updated' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  @ResponseMessage('Plan successfully updated')
  updatePlan(
    @Param('id') id: string,
    @Body() updatePlanDto: UpdatePlanDto
  ): Promise<Plan> {
    return this.plansService.update(id, updatePlanDto);
  }

  @Delete('plans/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove plan by ID' })
  @ApiResponse({ status: 204, description: 'Plan successfully removed' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  @ResponseMessage('Plan successfully removed')
  removePlan(@Param('id') id: string): Promise<void> {
    return this.plansService.remove(id);
  }
}
