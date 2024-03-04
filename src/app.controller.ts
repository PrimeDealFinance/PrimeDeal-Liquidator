import { RedisService } from './common/services/redis.service';
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PositionsService } from './positions/positions.service';
import { ApiExcludeEndpoint, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PositionManagerGateway } from './gateways/position-manager.gateway';

@Controller('api')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly redis: RedisService,
    private readonly positionsService: PositionsService,
    private positionManagerGateway: PositionManagerGateway,
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
  @ApiExcludeEndpoint()
  @Get('/close')
  async close() {
    await this.positionManagerGateway.closeWebSocketConnection();
    return 'WebSocket connection closed.';
  }

  @ApiExcludeEndpoint()
  @Get('/redis')
  async getPoolsFromRedis() {
    return await this.redis.getActivePoolAddresses();
  }

  @ApiExcludeEndpoint()
  @Get('/db')
  async getPoolsFromDB() {
    return await this.appService.activePools();
  }

  @ApiExcludeEndpoint()
  @Get('/delRedis')
  async delPoolFromRedis() {
    return await this.redis.removeGatewayAddress(
      '0x680752645E785B727E9E6Bf1D9d21C5F56175096',
    );
  }

  @ApiExcludeEndpoint()
  @Get('/err')
  async getErr() {
    return await this.appService.getErr();
  }
}
