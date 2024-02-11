import { RedisTestService } from './common/services/redis.service';
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PositionsService } from './positions/positions.service';
import { ApiExcludeEndpoint, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('api')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly redis: RedisTestService,
    private readonly positionsService: PositionsService,
  ) {}
  @ApiExcludeEndpoint()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @ApiExcludeEndpoint()
  @Get('/test')
  async test() {
    await this.redis.testConnection();
    return 'Redis test completed';
  }
  @ApiOperation({ summary: 'End-point for getting info about pools' })
  @ApiResponse({
    status: 200,
    description:
      'Return list of pools with data about contract&tokens addresses',
  })
  @Get('/pools')
  getUPools() {
    return this.positionsService.getPools();
  }
  @ApiOperation({ summary: 'End-point for getting info about positions' })
  @ApiResponse({
    status: 200,
    description: 'Return list of positions with its current statuses',
  })
  @Get('/positions')
  getUPositions() {
    return this.positionsService.getPositions();
  }
}
