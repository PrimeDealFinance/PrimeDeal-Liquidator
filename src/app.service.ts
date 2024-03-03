import { Injectable } from '@nestjs/common';
import { RedisService } from './common/services/redis.service';
// import { GatewayFactory } from './gateways/dynamicGateway/gatewayFactory';
// import { QueueService } from './common/services/queue.service';
import { Pools } from './common/models/poolsTable.model';
import { InjectModel } from '@nestjs/sequelize';
import { QueuesService } from './queues/queues.service';
import { GatewaysService } from './gateways/gateways.service';

@Injectable()
export class AppService {
  constructor(
    private readonly redisService: RedisService,
    private readonly gatewayService: GatewaysService,
    // private readonly gatewayFactory: GatewayFactory,

    private readonly queueService: QueuesService,

    @InjectModel(Pools) private readonly poolsRepository: typeof Pools,
  ) {}

  async activePools(): Promise<Pools[]> {
    return await this.poolsRepository.findAll({
      where: { isActive: true },
      attributes: ['poolAddress'],
    });
  }

  async onModuleInit() {
    const activePools = await this.activePools();
    if (activePools.length > 0) {
      for (const pool of activePools) {
        await this.gatewayService.createGateway(
          pool.poolAddress,
          this.queueService,
        );
      }
      await this.redisService.addActivePoolsToRedisBatch(activePools);
    }
  }

  getHello(): string {
    // throw new Error('hi');
    return 'Hello UniSwap!!!!!';
  }

  getErr() {
    try {
      throw new Error('hello');
    } catch (error) {
      console.log(error);
    }
  }

  getTest() {
    this.getErr();
  }
}
