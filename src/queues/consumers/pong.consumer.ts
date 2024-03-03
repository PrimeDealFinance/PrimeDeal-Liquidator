import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ALIVE_QUEUE } from '../../common/constants';

@Processor(ALIVE_QUEUE)
export class AliveQueueConsumer {
  @Process('PONG')
  async handlePongJob(
    job: Job,
  ): Promise<{ success: boolean; jobId: string | number }> {
    return { success: true, jobId: job.id };
  }
}
