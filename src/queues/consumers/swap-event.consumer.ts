import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { SWAP_EVENT, TRANSACTION_QUEUE } from '../../common/constants';
import { PositionsService } from 'src/positions/positions.service';
import { Logger } from '@nestjs/common';

@Processor(SWAP_EVENT)
export class SwapEventConsumer {
  private readonly logger = new Logger(SwapEventConsumer.name);
  constructor(
    @InjectQueue(TRANSACTION_QUEUE) private transactionQueue: Queue,
    private readonly positionService: PositionsService,
  ) {}

  @Process('catchSwap')
  async handleFindPosition(job: Job): Promise<{ status: string }> {
    try {
      const { poolAddress, tick } = job.data;
      const results = await this.positionService.findPositionsToClose(
        poolAddress,
        tick,
      );
      // add batch fetch and add to queue
      if (results.length > 0) {
        // for (const position of results) {
        //   await this.transactionQueue.add('makeTx', {
        //     positionId: position.positionId,
        //   });
        // }
        const positionsIds = results.map((position) => position.positionId);
        await this.transactionQueue.add('makeTx', {
          ids: positionsIds,
        });
        return {
          status: `we have ${results.length} positions to close and we make jobs for them in transaction queue!`,
        };
      } else {
        return {
          status: 'we don`t have any positions to close',
        };
      }
    } catch (error) {
      this.logger.error('Error while job', job.id, (error as Error).message);
      throw error;
    }
  }
}
