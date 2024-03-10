import {
  // OnQueueActive,
  // OnQueueCompleted,
  Process,
  Processor,
} from '@nestjs/bull';
import { Job } from 'bull';
import { PositionsService } from '../../positions/positions.service';
import { POSITION_QUEUE } from '../../common/constants';
import { Logger } from '@nestjs/common';
// import { Logger } from '@nestjs/common';

@Processor(POSITION_QUEUE)
export class PositionConsumer {
  private readonly logger = new Logger(PositionConsumer.name);
  constructor(private readonly positionsService: PositionsService) {}

  @Process('openPosition')
  async handlePositionCreation(job: Job): Promise<{ status: string }> {
    try {
      const newPosition = job.data;
      await this.positionsService.createPosition(newPosition);
      return {
        status: `Position with id: ${newPosition.positionId} is opened`,
      };
    } catch (error) {
      this.logger.error(
        'Error while working',
        job.id,
        (error as Error).message,
      );
      throw error;
    }
  }

  @Process('changePositionStatus')
  async handleChangeStatus(
    job: Job<{ positionId: number }>,
  ): Promise<{ status: string }> {
    try {
      const { positionId } = job.data;
      await this.positionsService.changePositionStatus(positionId);
      return { status: `Position with id: ${positionId} is closed` };
    } catch (error) {
      this.logger.error(
        'Error while changing position status',
        job.id,
        (error as Error).message,
      );
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
