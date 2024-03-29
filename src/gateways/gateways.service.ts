import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from 'src/common/services/redis.service';
import { QueuesService } from 'src/queues/queues.service';
import { WsKeepAliveService } from './wsKeepAlive.service';
import { DynamicPoolGateway } from './dynamicPoolGateway';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GatewaysService {
  private readonly logger = new Logger(GatewaysService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly queueService: QueuesService,
    private readonly aliveQueue: QueuesService,
    private configService: ConfigService,
  ) {}

  //FIX optimize redis search
  // async function checkAndCreateGateway(poolAddress: string): Promise<void> {
  //   const result = await this.redisService.client.setnx(poolAddress, "gatewayValue");

  //   if (result === 1) {
  //     console.log(`Creating new gateway for ${poolAddress}`);
  //     await this.createGateway(poolAddress, this.queueService);
  //     await this.queueService.addPoll(poolAddress);
  //   } else {
  //     console.log(`Gateway for ${poolAddress} already exists.`);
  //   }
  // }

  async checkGatewayExists(poolAddress: string): Promise<void> {
    const existingPoolGateway =
      await this.redisService.getGatewayAddress(poolAddress);

    if (!existingPoolGateway) {
      this.logger.log(`Creating new gateway for ${poolAddress}`);
      await this.createGateway(poolAddress, this.queueService);
      await this.redisService.setGatewayAddress(poolAddress);
      await this.queueService.addPoll(poolAddress);
    } else {
      this.logger.log(`Gateway for ${poolAddress} already exists`);
    }
  }

  createKeeper(label: string): WsKeepAliveService {
    return new WsKeepAliveService(this.aliveQueue, label, this.configService);
  }

  async createGateway(
    poolAddress: string,
    queueService: QueuesService,
  ): Promise<DynamicPoolGateway> {
    const wsKeepAliveService = this.createKeeper(poolAddress.slice(0, 5));
    const gateway = new DynamicPoolGateway(
      poolAddress,
      queueService,
      wsKeepAliveService,
      this.configService,
    );
    gateway.connectAndSubscribe();
    return gateway;
  }
}
