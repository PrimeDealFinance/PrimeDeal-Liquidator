import { Process, Processor } from '@nestjs/bull';
import { TRANSACTION_QUEUE } from '../../common/constants';
import { Job } from 'bull';
import { PositionsService } from 'src/positions/positions.service';
import * as pMap from 'p-map';

@Processor(TRANSACTION_QUEUE)
export class TransactionConsumer {
  constructor(private readonly positionsService: PositionsService) {}

  @Process('makeTx')
  async handleTransaction(job: Job): Promise<{ status: Array<string> }> {
    try {
      const { positionsIds } = job.data;

      const txResponses = await pMap(
        positionsIds,
        (positionId: string) => this.positionsService.closePosition(positionId),
        { concurrency: 2 },
      );
      const txHashes = txResponses.map(
        (txResponse) => txResponse.transactionHash,
      );

      // const txResponse = await this.positionsService.closePosition(positionId);

      return {
        // status: `txHash is ${txResponse.transactionHash}`,
        status: txHashes.map((txHash) => `txHash is ${txHash}`),
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
