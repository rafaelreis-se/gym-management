import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData() {
    return {
      name: 'Gym Management API',
      version: '1.0.0',
      description: 'Management system for martial arts gyms',
      documentation: '/api/docs',
    };
  }

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
