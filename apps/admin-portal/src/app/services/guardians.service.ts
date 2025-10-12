import { apiClient } from './api.config';
import { GuardianData } from './students.service';

export const guardiansService = {
  /**
   * Get all guardians
   */
  async getAll() {
    const response = await apiClient.get('/guardians');
    return response.data;
  },

  /**
   * Get guardian by ID
   */
  async getById(id: string) {
    const response = await apiClient.get(`/guardians/${id}`);
    return response.data;
  },

  /**
   * Search guardian by CPF
   * Returns null if not found
   */
  async findByCpf(cpf: string): Promise<GuardianData | null> {
    try {
      const response = await apiClient.get(`/guardians/cpf/${cpf}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Get guardians for a specific student
   */
  async getByStudent(studentId: string) {
    const response = await apiClient.get(`/guardians/student/${studentId}`);
    return response.data;
  },

  /**
   * Create new guardian
   */
  async create(data: GuardianData) {
    const response = await apiClient.post('/guardians', data);
    return response.data;
  },

  /**
   * Update guardian
   */
  async update(id: string, data: Partial<GuardianData>) {
    const response = await apiClient.patch(`/guardians/${id}`, data);
    return response.data;
  },

  /**
   * Delete guardian
   */
  async delete(id: string) {
    const response = await apiClient.delete(`/guardians/${id}`);
    return response.data;
  },
};

