import { Module, forwardRef } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Position } from './models/position.model';
import { Pools } from 'src/common/models/poolsTable.model';
import { QueuesModule } from 'src/queues/queues.module';
import { PoolService } from './pool.service';
import { RoundRobinService } from './roundRobin.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Position, Pools]),
    forwardRef(() => QueuesModule),
  ],

  providers: [PositionsService, PoolService, RoundRobinService],

  exports: [PositionsService, PoolService],
})
export class PositionsModule {}
