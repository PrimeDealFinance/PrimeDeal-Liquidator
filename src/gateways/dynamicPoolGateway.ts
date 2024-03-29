import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { abi_pool } from 'src/contracts/pool/abi';
import { WsKeepAliveService } from './wsKeepAlive.service';
import { QueuesService } from 'src/queues/queues.service';
import { createProviderWs } from 'src/common/utils/providers';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DynamicPoolGateway {
  private readonly logger = new Logger(DynamicPoolGateway.name);

  private provider: ethers.providers.WebSocketProvider;
  private contract: ethers.Contract;
  private reconnectTimeout?: NodeJS.Timeout;

  private initializeProviderAndContract() {
    this.provider = createProviderWs(
      this.configService.get<string>('ALCHEMY_WS_URL'),
    );
    this.contract = new ethers.Contract(
      this.poolAddress,
      abi_pool,
      this.provider,
    );
  }
  constructor(
    private readonly poolAddress: string,
    private readonly queueService: QueuesService,
    private readonly wsKeepAliveService: WsKeepAliveService,
    private configService: ConfigService,
  ) {}

  async cleanupOldShit() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = undefined;
    }
    this.provider = null;
    this.contract = null;
  }

  async initializeKeepAlive() {
    this.wsKeepAliveService.keepAlive({
      provider: this.provider,
      onDisconnect: (err) => {
        this.logger.error('Lost WS connection, try to reconnect...', err);
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
        }
        this.reconnectTimeout = setTimeout(() => {
          this.logger.log('Attempting to reconnect...');
          this.connectAndSubscribe();
        }, 10000);
      },
    });
  }

  async connectAndSubscribe() {
    await this.cleanupOldShit();
    this.initializeProviderAndContract();
    await this.subscribeToEvents();
    await this.initializeKeepAlive();
  }
  async subscribeToEvents() {
    this.logger.log(`NEW WebSocket for pool address: ${this.poolAddress}`);

    this.contract.on('Swap', (...args) => {
      const swap = {
        poolAddress: this.poolAddress,
        tick: args[6],
      };
      this.logger.log(`SWAP with ${swap.poolAddress}`);
      this.queueService.addEventToSwapEventQueue(swap);
    });
  }
}
