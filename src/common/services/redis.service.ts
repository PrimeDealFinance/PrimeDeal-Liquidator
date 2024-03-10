import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { Pools } from '../models/poolsTable.model';
@Injectable()
export class RedisService {
  private client: Redis;

  constructor() {
    this.client = new Redis('redis://nest-uni-redis:6379');
    // this.client = new Redis('redis://localhost:6399', {
    //   maxRetriesPerRequest: 50,
    // });
  }

  // onModuleInit() {
  //   console.log('Redis is connected');
  // }

  onModuleDestroy() {
    this.client.disconnect();
    // console.log('Redis is disconnected');
  }

  async setGatewayAddress(poolAddress: string): Promise<void> {
    await this.client.set(`gateway:${poolAddress}`, 'active');
  }

  async removeGatewayAddress(poolAddress: string): Promise<void> {
    await this.client.del(`gateway:${poolAddress}`);
  }

  async getGatewayAddress(poolAddress: string): Promise<string | null> {
    return await this.client.get(`gateway:${poolAddress}`);
  }

  async getActivePoolAddresses(): Promise<string[]> {
    const keys = await this.client.keys('gateway:*');
    return keys.map((key) => key.replace('gateway:', ''));
  }

  async addActivePoolsToRedisBatch(activePools: Pools[]) {
    const multi = this.client.multi();
    activePools.forEach((pool: Pools) => {
      multi.set(`gateway:${pool.poolAddress}`, 'active');
    });
    await multi.exec();
  }
}
