import { BullAdapter } from '@bull-board/api/bullAdapter';
import { GatewayFactory } from 'src/websocket/dynamicGateway/gatewayFactory';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { PositionsModule } from './positions/positions.module';
import { Position } from './positions/models/position.model';
import { BullModule } from '@nestjs/bull';
import {
  POSITION_QUEUE,
  TRANSACTION_QUEUE,
  SWAP_EVENT,
} from './common/constants';
import { QueueService } from './common/services/queue.service';
import { RedisTestService } from './common/services/redis.service';
import { PositionConsumer } from './common/consumers/position.consumer';
import { ClosePositionService } from './common/services/close-position.service';
import { SwapEventConsumer } from './common/consumers/swap-event.consumer';
import { TransactionConsumer } from './common/consumers/transaction.consumer';
import { PositionManagerGateway } from './websocket/position-manager.gateway';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      models: [Position],
      autoLoadModels: true,
    }),
    PositionsModule,
    BullModule.forRoot({
      redis: {
        host: 'nest-uni-redis', //localhost:6399
        port: 6379,
      },
    }),
    BullModule.registerQueue(
      {
        name: POSITION_QUEUE,
      },
      {
        name: SWAP_EVENT,
      },
      {
        name: TRANSACTION_QUEUE,
      },
    ),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature(
      {
        name: TRANSACTION_QUEUE,
        adapter: BullAdapter,
      },
      {
        name: POSITION_QUEUE,
        adapter: BullAdapter,
      },
      {
        name: SWAP_EVENT,
        adapter: BullAdapter,
      },
    ),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PositionManagerGateway,
    QueueService,
    RedisTestService,
    PositionConsumer,
    ClosePositionService,
    SwapEventConsumer,
    TransactionConsumer,
    GatewayFactory,
  ],
})
export class AppModule {}
