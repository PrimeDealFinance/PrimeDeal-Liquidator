import { Process, Processor } from '@nestjs/bull';
import { TRANSACTION_QUEUE } from '../../common/constants';
import { Job } from 'bull';
import { PositionsService } from 'src/positions/positions.service';

@Processor(TRANSACTION_QUEUE)
export class TransactionConsumer {
  constructor(private readonly positionsService: PositionsService) {}

  @Process('makeTx')
  async handleTransaction(job: Job): Promise<{ status: string }> {
    try {
      const { positionId } = job.data;

      const txResponse = await this.positionsService.closePosition(positionId);

      return {
        status: `txHash is ${txResponse.transactionHash}`,
      };
    } catch (error) {
      console.error(
        `Error processing transaction for position: ${
          (error as Error).message
        }`,
      );
      throw error;
    }
  }
}
