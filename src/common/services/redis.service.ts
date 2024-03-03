import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { Pools } from '../models/poolsTable.model';
@Injectable()
export class RedisService {
  private client: Redis;

  constructor() {
    this.client = new Redis('redis://nest-uni-redis:6379');
    this.testConnection();
  }

  onModuleInit() {
    console.log('Redis is connected');
  }

  onModuleDestroy() {
    this.client.disconnect();
    console.log('Redis is disconnected');
  }

  // FIX DEL
  async testConnection() {
    this.client.on('connect', () => console.log('Redis Client Connected'));
    this.client.on('error', (err) => console.log('Redis Client Error', err));

    try {
      await this.client.set('test', 'TEST RECORD');
      const value = await this.client.get('test');
      console.log('Redis test value:', value);
    } catch (error) {
      console.error('Redis testConnection error:', error);
    }
  }

  async setGatewayAddress(poolAddress: string): Promise<void> {
    await this.client.set(`gateway:${poolAddress}`, 'active');
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
