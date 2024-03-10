import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './common/services/redis.service';
import { Pools } from './common/models/poolsTable.model';
import { InjectModel } from '@nestjs/sequelize';
import { QueuesService } from './queues/queues.service';
import { GatewaysService } from './gateways/gateways.service';
import { extractErrorLocation } from './common/utils/errorStack';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(
    private readonly redisService: RedisService,
    private readonly gatewayService: GatewaysService,
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

  async delPoolFromRedis() {
    return await this.redisService.removeGatewayAddress(
      '0xeC617F1863bdC08856Eb351301ae5412CE2bf58B',
    );
  }

  getErr() {
    try {
      throw new Error('hello');
    } catch (error) {
      const errorLocation = extractErrorLocation((error as Error).stack || '');

      this.logger.error((error as Error).message, errorLocation);
    }
  }

  getTest() {
    this.getErr();
  }
}
