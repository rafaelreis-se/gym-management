import { apiClient } from './api.config';

export interface StudentData {
  fullName: string;
  email: string;
  cpf: string;
  rg?: string;
  birthDate: Date | string;
  phone: string;
  emergencyPhone?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  ageCategory: string;
  status?: string;
  medicalObservations?: string;
  notes?: string;
}

export interface GuardianData {
  id?: string;
  fullName: string;
  email: string;
  cpf: string;
  rg?: string;
  birthDate?: Date | string;
  phone: string;
  alternativePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  profession?: string;
  notes?: string;
}

export interface StudentWithGuardianData {
  student: StudentData;
  guardian?: GuardianData;
  guardianRelationship?: {
    relationship: string;
    isFinanciallyResponsible?: boolean;
    isEmergencyContact?: boolean;
    canPickUp?: boolean;
  };
}

export const studentsService = {
  /**
   * Get all students
   */
  async getAll() {
    const response = await apiClient.get('/students');
    return response.data;
  },

  /**
   * Get student by ID
   */
  async getById(id: string) {
    const response = await apiClient.get(`/students/${id}`);
    return response.data;
  },

  /**
   * Create new student (simple)
   */
  async create(data: StudentData) {
    const response = await apiClient.post('/students', data);
    return response.data;
  },

  /**
   * Create student with guardian
   * Uses the new endpoint that handles guardian relationship
   */
  async createWithGuardian(data: StudentWithGuardianData) {
    const response = await apiClient.post('/students/with-guardian', data);
    return response.data;
  },

  /**
   * Update student
   */
  async update(id: string, data: Partial<StudentData>) {
    const response = await apiClient.patch(`/students/${id}`, data);
    return response.data;
  },

  /**
   * Delete student
   */
  async delete(id: string) {
    const response = await apiClient.delete(`/students/${id}`);
    return response.data;
  },
};

