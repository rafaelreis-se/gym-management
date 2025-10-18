import { apiClient } from './api.config';

export interface DashboardStats {
  totalStudents: number;
  revenueThisMonth: number;
  activeEnrollments: number;
  overduePayments: number;
}

export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    try {
      const response = await apiClient.get('/dashboard/stats');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },
};
