import { Injectable } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class RedisTestService {
  private client;

  constructor() {
    this.client = createClient({
      url: 'redis://nest-uni-redis:6379',
    });
    this.testConnection();
  }

  async testConnection() {
    this.client.on('error', (err) => console.log('Redis Client Error', err));

    await this.client.connect();

    await this.client.set('test', 'REDIS IS CONNECTED');
    const value = await this.client.get('test');
    console.log('Redis test value:', value);

    await this.client.disconnect();
  }
}
