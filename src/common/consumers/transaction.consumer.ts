import { Process, Processor } from '@nestjs/bull';
import { TRANSACTION_QUEUE } from '../constants';
import { ClosePositionService } from '../services/close-position.service';
import { Job } from 'bull';

@Processor(TRANSACTION_QUEUE)
export class TransactionConsumer {
  constructor(private readonly closePositionService: ClosePositionService) {}

  @Process('makeTx')
  async handleTransaction(job: Job) {
    try {
      const { positionId } = job.data;

      const txResponse =
        await this.closePositionService.closePosition(positionId);

      return {
        status: `txHash is ${txResponse.transactionHash}`,
      };
    } catch (error) {
      console.error(
        `Error processing transaction for position: ${
          (error as Error).message
        }`,
      );
    }
  }
}
