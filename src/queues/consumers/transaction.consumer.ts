import { Process, Processor } from '@nestjs/bull';
import { TRANSACTION_QUEUE } from '../../common/constants';
import { Job } from 'bull';
import { PositionsService } from 'src/positions/positions.service';
import * as Bluebird from 'bluebird';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

@Processor(TRANSACTION_QUEUE)
export class TransactionConsumer {
  private readonly logger = new Logger(TransactionConsumer.name);

  constructor(
    private readonly positionsService: PositionsService,
    private configService: ConfigService,
  ) {}

  @Process('makeTx')
  async handleTransaction(job: Job): Promise<{ status: Array<string> }> {
    const concurrencyAmount = +this.configService.get<number>('KEYS_AMOUNT');
    try {
      const { ids } = job.data;
      const txResponses = await Bluebird.map(
        ids,
        async (id: number) => {
          try {
            return await this.positionsService.closePosition(id);
          } catch (error) {
            this.logger.error(
              `Error in tx for position with ${id}: ${(error as Error).message}`,
            );
            return { error: true, id, message: (error as Error).message };
          }
        },
        { concurrency: concurrencyAmount },
      );
      const txHashes = txResponses.map((txResponse) => {
        if ('error' in txResponse && txResponse.error) {
          return {
            txHash: `Error for ID ${txResponse.id}: ${txResponse.message}`,
            timestamp: new Date().toISOString(),
          };
        } else {
          const successfulResponse =
            txResponse as ethers.providers.TransactionReceipt;
          return {
            txHash: successfulResponse.transactionHash,
            timestamp: new Date().toISOString(),
          };
        }
      });

      return {
        status: txHashes.map(
          (txInfo, index) =>
            `txHash ${index + 1} is ${txInfo.txHash} at ${txInfo.timestamp}`,
        ),
      };
    } catch (error) {
      this.logger.error(
        `Error processing transaction for position: ${
          (error as Error).message
        }`,
      );
      throw error;
    }
  }
}
