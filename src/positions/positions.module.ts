import { Module } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Position } from './models/position.model';
import { PositionsController } from './positions.controller';
import { PoolsTable } from 'src/common/models/poolsTable.model';

@Module({
  imports: [SequelizeModule.forFeature([Position, PoolsTable])],

  providers: [PositionsService],

  controllers: [PositionsController],
  exports: [PositionsService],
})
export class PositionsModule {}
