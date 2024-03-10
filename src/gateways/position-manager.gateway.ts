import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ethers } from 'ethers';
import { abi_position } from '../contracts/positionManager/abi';
import { QueuesService } from 'src/queues/queues.service';
import { WsKeepAliveService } from './wsKeepAlive.service';
import { GatewaysService } from './gateways.service';
import { createProviderWs } from 'src/common/utils/providers';
import { createContract } from 'src/common/utils/contractPM';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PositionManagerGateway implements OnModuleInit {
  private readonly logger = new Logger(PositionManagerGateway.name);
  private provider: ethers.providers.WebSocketProvider;
  private contract: ethers.Contract;
  private reconnectTimeout?: NodeJS.Timeout;
  private wsKeepAliveService: WsKeepAliveService;
  constructor(
    private readonly queueService: QueuesService,
    private readonly gatewayService: GatewaysService,
    private configService: ConfigService,
  ) {
    this.wsKeepAliveService = this.gatewayService.createKeeper('MAIN');
  }
  private initializeProviderAndContract() {
    this.provider = createProviderWs(
      this.configService.get<string>('ALCHEMY_WS_URL'),
    );
    this.contract = createContract(
      this.configService.get<string>('PM_CONTRACT_ADDRESS'),
      abi_position,
      this.provider,
    );
  }

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

  onModuleInit() {
    this.connectAndSubscribe();
  }

  // FIX - its only for test
  async closeWebSocketConnection() {
    if (this.provider && this.provider._websocket) {
      console.log('Закрытие WebSocket соединения...');
      this.provider._websocket.close();
    }
  }

  async subscribeToEvents() {
    this.logger.log('START manager');
    this.contract.on(
      'BuyPositionOpened',
      async (positionId, user, stopTick, poolAddress, amountA) => {
        const newPosition = {
          positionId: Number(positionId),
          user,
          stopTick,
          poolAddress,
          amount: Math.round(
            Number(ethers.utils.formatUnits(amountA, 'ether')),
          ),
          direction: 'buy',
        };
        this.logger.log(`NEW POSITION: ${newPosition.positionId}`);

        await this.queueService.openPosition(newPosition);
        await this.gatewayService.checkGatewayExists(newPosition.poolAddress);
      },
    );

    this.contract.on(
      'SellPositionOpened',
      async (positionId, user, stopTick, poolAddress, amountB) => {
        const newPosition = {
          positionId: Number(positionId),
          user,
          stopTick,
          poolAddress,
          amount: Math.round(
            Number(ethers.utils.formatUnits(amountB, 'ether')),
          ),
          direction: 'sell',
        };
        await this.queueService.openPosition(newPosition);
        await this.gatewayService.checkGatewayExists(newPosition.poolAddress);
      },
    );

    this.contract.on('PositionClosed', (positionId) => {
      const closePosition = {
        positionId: Number(positionId),
      };
      this.logger.log(`CLOSE POSITION: ${closePosition.positionId}`);
      this.queueService.changePositionStatus(closePosition.positionId);
    });
  }
}
