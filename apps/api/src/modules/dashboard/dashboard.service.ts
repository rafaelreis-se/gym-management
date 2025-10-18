import { Injectable } from '@nestjs/common';
import { StudentsService } from '../students/students.service';
import { EnrollmentsService } from '../enrollments/enrollments.service';
import { FinancialService } from '../financial/financial.service';

export interface DashboardStats {
  totalStudents: number;
  revenueThisMonth: number;
  activeEnrollments: number;
  overduePayments: number;
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly enrollmentsService: EnrollmentsService,
    private readonly financialService: FinancialService
  ) {}

  async getStats(): Promise<DashboardStats> {
    try {
      // Get total students count
      const studentsResult = await this.studentsService.findAll({
        page: 1,
        limit: 1,
      });
      const totalStudents = studentsResult.meta.totalItems;

      // Get active enrollments count
      // For now, we'll use a simple approach - in a real system you'd filter by active status
      const enrollmentsResult = await this.enrollmentsService.findAll({
        page: 1,
        limit: 1,
      });
      const activeEnrollments = enrollmentsResult.meta.totalItems;

      // Get revenue this month (mock for now - would need proper financial queries)
      // This is a simplified calculation - in a real system you'd query actual payments
      const revenueThisMonth = activeEnrollments * 150; // Assuming average of R$ 150 per enrollment

      // Get overdue payments (mock for now)
      const overduePayments = Math.floor(activeEnrollments * 0.1); // Assume 10% have overdue payments

      return {
        totalStudents,
        revenueThisMonth,
        activeEnrollments,
        overduePayments,
      };
    } catch (error) {
      console.error('Error calculating dashboard stats:', error);
      // Return default values on error
      return {
        totalStudents: 0,
        revenueThisMonth: 0,
        activeEnrollments: 0,
        overduePayments: 0,
      };
    }
  }
}
