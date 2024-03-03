import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { abi_pool } from 'src/contracts/pool/abi';
import { InjectModel } from '@nestjs/sequelize';
import { Pools } from '../common/models/poolsTable.model';
import { CreatePoolDto, CreatePoolDtoType } from '../common/types';
import { ConfigService } from '@nestjs/config';
import { createProvider } from 'src/common/utils/providers';

@Injectable()
export class PoolService {
  constructor(
    @InjectModel(Pools)
    private readonly poolsRepository: typeof Pools,
    private configService: ConfigService,
  ) {}
  private readonly provider = createProvider(
    this.configService.get<string>('ALCHEMY_MUMBAI_HTTPS'),
  );
  //
  async getTokens(
    newPoolAddress: string,
  ): Promise<{ tokenA: string; tokenB: string }> {
    try {
      const contract = new ethers.Contract(
        newPoolAddress,
        abi_pool,
        this.provider,
      );
      const tokenA = await contract.token0();
      const tokenB = await contract.token1();
      return { tokenA, tokenB };
    } catch (error) {
      console.error('Error get tokens from pool:', (error as Error).message);
      throw error;
    }
  }

  async getTokenSymbol(tokenAddress: string): Promise<string> {
    try {
      const contract = new ethers.Contract(
        tokenAddress,
        ['function symbol() view returns (string)'],
        this.provider,
      );
      return await contract.symbol();
    } catch (error) {
      console.error('Error get token symbol:', (error as Error).message);
      throw error;
    }
  }

  async findOrCreatePool(
    poolAddress: string,
    poolData: CreatePoolDtoType,
  ): Promise<Pools> {
    const parsedPool = CreatePoolDto.parse(poolData);
    const [pool, created] = await this.poolsRepository.findOrCreate({
      where: { poolAddress: poolAddress },
      defaults: parsedPool,
    });

    if (created) {
      console.log('Pool created');
      return pool;
    } else {
      console.log('Pool already exists');
      return pool;
    }
  }
}
