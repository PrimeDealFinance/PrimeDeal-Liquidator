import { Module } from '@nestjs/common';
import { BullBoardModule } from '@bull-board/nestjs';
import {
  POSITION_QUEUE,
  TRANSACTION_QUEUE,
  SWAP_EVENT,
  ALIVE_QUEUE,
  POOL_QUEUE,
} from '../common/constants';
import { BullModule } from '@nestjs/bull';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { QueuesService } from './queues.service';
import { PositionsModule } from 'src/positions/positions.module';
import { PositionConsumer } from './consumers/position.consumer';
import { SwapEventConsumer } from './consumers/swap-event.consumer';
import { AliveQueueConsumer } from './consumers/pong.consumer';
import { PoolConsumer } from './consumers/pool.consumer';
import { TransactionConsumer } from './consumers/transaction.consumer';

@Module({
  imports: [
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
      {
        name: ALIVE_QUEUE,
      },
      {
        name: POOL_QUEUE,
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
      {
        name: ALIVE_QUEUE,
        adapter: BullAdapter,
      },
      {
        name: POOL_QUEUE,
        adapter: BullAdapter,
      },
    ),
    // forwardRef(() => PositionsModule),
    PositionsModule,
  ],
  providers: [
    QueuesService,
    PositionConsumer,
    SwapEventConsumer,
    AliveQueueConsumer,
    PoolConsumer,
    TransactionConsumer,
  ],
  exports: [BullModule, QueuesService],
})
export class QueuesModule {}
