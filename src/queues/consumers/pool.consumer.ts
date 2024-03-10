import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { POOL_QUEUE } from '../../common/constants';
import { PoolService } from '../../positions/pool.service';
import { CreatePoolDtoType } from '../../common/types';
import { Logger } from '@nestjs/common';

@Processor(POOL_QUEUE)
export class PoolConsumer {
  private readonly logger = new Logger(PoolConsumer.name);
  constructor(private readonly poolService: PoolService) {}

  @Process('addPool')
  async handlePoolCreation(job: Job): Promise<void> {
    try {
      const newPoolAddress = job.data;
      const { tokenA, tokenB } =
        await this.poolService.getTokens(newPoolAddress);
      const tokenAsymbol = await this.poolService.getTokenSymbol(tokenA);
      const tokenBsymbol = await this.poolService.getTokenSymbol(tokenB);
      const poolData: CreatePoolDtoType = {
        poolAddress: newPoolAddress,
        tokenAcontract: tokenA,
        tokenBcontract: tokenB,
        tokenAsymbol,
        tokenBsymbol,
      };
      await this.poolService.findOrCreatePool(newPoolAddress, poolData);
    } catch (error) {
      this.logger.error(
        'Error while working',
        job.id,
        (error as Error).message,
      );
      throw error;
    }
  }
}
