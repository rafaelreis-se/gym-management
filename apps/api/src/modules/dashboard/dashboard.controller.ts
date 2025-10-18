import {
  Controller,
  Get,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@gym-management/common';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getStats() {
    try {
      const stats = await this.dashboardService.getStats();
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw new HttpException(
        'Error retrieving dashboard statistics',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
