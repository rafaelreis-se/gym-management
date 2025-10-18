import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource
  ) {}

  getData() {
    return {
      name: 'Gym Management API',
      version: '1.0.0',
      description: 'Management system for martial arts gyms',
      documentation: '/api/docs',
    };
  }

  async getHealth() {
    const startTime = Date.now();

    // Verificar conexão com banco de dados
    let database = {
      status: 'unknown',
      responseTime: 0,
    };

    try {
      const dbStartTime = Date.now();
      await this.dataSource.query('SELECT 1');
      database = {
        status: 'healthy',
        responseTime: Date.now() - dbStartTime,
      };
    } catch (error) {
      void error; // Explicitly ignore the error variable
      database = {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
      };
    }

    const totalResponseTime = Date.now() - startTime;
    const isHealthy = database.status === 'healthy';

    return {
      status: isHealthy ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      uptimeFormatted: this.formatUptime(process.uptime()),
      responseTime: totalResponseTime,
      checks: {
        database,
        memory: this.getMemoryInfo(),
        environment: process.env['NODE_ENV'] || 'development',
      },
      version: '1.0.0',
    };
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${secs}s`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  private getMemoryInfo() {
    const used = process.memoryUsage();
    return {
      rss: Math.round((used.rss / 1024 / 1024) * 100) / 100,
      heapTotal: Math.round((used.heapTotal / 1024 / 1024) * 100) / 100,
      heapUsed: Math.round((used.heapUsed / 1024 / 1024) * 100) / 100,
      external: Math.round((used.external / 1024 / 1024) * 100) / 100,
      unit: 'MB',
    };
  }
}
