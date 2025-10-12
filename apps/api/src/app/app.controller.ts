import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from '../modules/auth/decorators/public.decorator';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Application is healthy' })
  getHealth() {
    return this.appService.getHealth();
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get API information' })
  @ApiResponse({ status: 200, description: 'Returns API info' })
  getData() {
    return this.appService.getData();
  }
}
