import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NfseService } from './nfse.service';
import {
  CreateNfseDto,
  UpdateNfseDto,
  SendNfseDto,
  CancelNfseDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@gym-management/types';

@ApiTags('NFS-e')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('nfse')
export class NfseController {
  constructor(private readonly nfseService: NfseService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Create a new NFS-e' })
  @ApiResponse({ status: 201, description: 'NFS-e created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createNfseDto: CreateNfseDto) {
    return this.nfseService.create(createNfseDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Get all NFS-e' })
  @ApiResponse({ status: 200, description: 'List of NFS-e' })
  findAll() {
    return this.nfseService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Get NFS-e by ID' })
  @ApiResponse({ status: 200, description: 'NFS-e found' })
  @ApiResponse({ status: 404, description: 'NFS-e not found' })
  findOne(@Param('id') id: string) {
    return this.nfseService.findOne(id);
  }

  @Get('number/:number/series/:series')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Get NFS-e by number and series' })
  @ApiResponse({ status: 200, description: 'NFS-e found' })
  @ApiResponse({ status: 404, description: 'NFS-e not found' })
  findByNumber(
    @Param('number') number: string,
    @Param('series') series: string
  ) {
    return this.nfseService.findByNumber(parseInt(number), series);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Update NFS-e' })
  @ApiResponse({ status: 200, description: 'NFS-e updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'NFS-e not found' })
  update(@Param('id') id: string, @Body() updateNfseDto: UpdateNfseDto) {
    return this.nfseService.update(id, updateNfseDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Delete NFS-e' })
  @ApiResponse({ status: 200, description: 'NFS-e deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'NFS-e not found' })
  remove(@Param('id') id: string) {
    return this.nfseService.remove(id);
  }

  @Post('send')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Send NFS-e to webservice' })
  @ApiResponse({ status: 200, description: 'NFS-e sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  sendNfse(@Body() sendNfseDto: SendNfseDto) {
    return this.nfseService.sendNfse(sendNfseDto.nfseIds);
  }

  @Post('cancel')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Cancel NFS-e' })
  @ApiResponse({ status: 200, description: 'NFS-e cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'NFS-e not found' })
  cancelNfse(@Body() cancelNfseDto: CancelNfseDto) {
    return this.nfseService.cancelNfse(
      cancelNfseDto.nfseId,
      cancelNfseDto.reason
    );
  }

  @Get(':id/status')
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @ApiOperation({ summary: 'Consult NFS-e status' })
  @ApiResponse({ status: 200, description: 'NFS-e status retrieved' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'NFS-e not found' })
  consultStatus(@Param('id') id: string) {
    return this.nfseService.consultNfseStatus(id);
  }
}
