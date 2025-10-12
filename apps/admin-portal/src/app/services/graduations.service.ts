import { apiClient } from './api.config';

export interface GraduationData {
  studentId: string;
  modality: string;
  beltColor: string;
  beltDegree: string;
  graduationDate: Date | string;
  grantedBy?: string;
  notes?: string;
}

export const graduationsService = {
  /**
   * Get all graduations
   */
  async getAll() {
    const response = await apiClient.get('/graduations');
    return response.data;
  },

  /**
   * Get graduation by ID
   */
  async getById(id: string) {
    const response = await apiClient.get(`/graduations/${id}`);
    return response.data;
  },

  /**
   * Get graduations for a specific student
   */
  async getByStudent(studentId: string) {
    const response = await apiClient.get(`/graduations/student/${studentId}`);
    return response.data;
  },

  /**
   * Create new graduation
   */
  async create(data: GraduationData) {
    const response = await apiClient.post('/graduations', data);
    return response.data;
  },

  /**
   * Delete graduation
   */
  async delete(id: string) {
    const response = await apiClient.delete(`/graduations/${id}`);
    return response.data;
  },
};

