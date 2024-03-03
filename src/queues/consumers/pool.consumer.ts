import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { POOL_QUEUE } from '../../common/constants';
import { PoolService } from '../../positions/pool.service';
import { CreatePoolDtoType } from '../../common/types';

@Processor(POOL_QUEUE)
export class PoolConsumer {
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
      console.error('Error while working', job.id, error);
      throw error;
    }
  }
}
