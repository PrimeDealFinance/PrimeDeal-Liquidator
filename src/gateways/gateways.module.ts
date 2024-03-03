import { Module } from '@nestjs/common';
import { GatewaysService } from './gateways.service';
import { PositionManagerGateway } from './position-manager.gateway';
import { QueuesModule } from 'src/queues/queues.module';
import { RedisService } from 'src/common/services/redis.service';

@Module({
  imports: [QueuesModule],
  providers: [GatewaysService, PositionManagerGateway, RedisService],
  exports: [PositionManagerGateway, GatewaysService],
})
export class GatewaysModule {}
