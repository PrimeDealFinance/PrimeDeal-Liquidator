import {
  // OnQueueActive,
  // OnQueueCompleted,
  Process,
  Processor,
} from '@nestjs/bull';
import { Job } from 'bull';
import { PositionsService } from '../../positions/positions.service';
import { POSITION_QUEUE } from '../constants';
// import { Logger } from '@nestjs/common';

@Processor(POSITION_QUEUE)
export class PositionConsumer {
  constructor(private readonly positionsService: PositionsService) {}

  @Process('openPosition')
  async handlePositionCreation(job: Job) {
    try {
      const newPosition = job.data;
      await this.positionsService.createPosition(newPosition);
      return {
        status: `Position with id: ${newPosition.positionId} is opened`,
      };
    } catch (error) {
      console.error('Error while working', job.id, error);
      throw error;
    }
  }

  @Process('changePositionStatus')
  async handleChangeStatus(job: Job<{ positionId: number }>) {
    try {
      const { positionId } = job.data;
      await this.positionsService.changePositionStatus(positionId);
      return { status: `Position with id: ${positionId} is closed` };
    } catch (error) {
      console.error('Error while changing position status', job.id, error);
      throw error;
    }
  }

  // we dont use it - its only for example how u can logging job proccess
  // @OnQueueActive()
  // onActive(job: Job<unknown>) {
  //   // Log that job is starting
  //   Logger.log(`Starting job ${job.id} : ${job.data}`);
  // }

  // @OnQueueCompleted()
  // onCompleted(job: Job<unknown>) {
  //   // Log job completion status
  //   Logger.log(`Job ${job.id} has been finished`);
  // }
}
