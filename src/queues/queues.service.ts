import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {
  ALIVE_QUEUE,
  POOL_QUEUE,
  POSITION_QUEUE,
  SWAP_EVENT,
} from '../common/constants';
import {
  NewPositionSchema,
  NewPositionType,
  SwapEventSchema,
  SwapEventType,
} from 'src/common/types';
import { Job } from 'bull';

@Injectable()
export class QueuesService {
  constructor(
    @InjectQueue(POSITION_QUEUE) private position: Queue,
    @InjectQueue(SWAP_EVENT) private swapEvent: Queue,
    @InjectQueue(ALIVE_QUEUE) private aliveQueue: Queue,
    @InjectQueue(POOL_QUEUE) private poolQueue: Queue,
  ) {}

  async openPosition(eventData: NewPositionType): Promise<Job> {
    const data = NewPositionSchema.parse(eventData);
    return await this.position.add('openPosition', data);
  }

  async changePositionStatus(positionId: number): Promise<Job> {
    return await this.position.add('changePositionStatus', {
      positionId,
    });
  }

  async addEventToSwapEventQueue(eventData: SwapEventType): Promise<Job> {
    const data = SwapEventSchema.parse(eventData);
    return await this.swapEvent.add('catchSwap', data);
  }

  async addPong(timestamp: string): Promise<Job> {
    return await this.aliveQueue.add('PONG', {
      iAmAlive: timestamp,
    });
  }

  async addPoll(poolAddress: string): Promise<Job> {
    return await this.poolQueue.add('addPool', poolAddress);
  }
}
