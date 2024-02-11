import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { contract } from '../contracts/positionManager/contract';
import { QueueService } from 'src/common/services/queue.service';
import { ethers } from 'ethers';
import { GatewayFactory } from 'src/websocket/dynamicGateway/gatewayFactory';

@Injectable()
@WebSocketGateway()
export class PositionManagerGateway implements OnGatewayInit {
  constructor(
    private readonly queueService: QueueService,
    private readonly gatewayFactory: GatewayFactory,
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit() {
    this.initializeWebSocket();
  }

  async initializeWebSocket() {
    console.log('START manager');
    contract.on(
      'BuyPositionOpened',
      async (positionId, user, stopTick, poolAddress, amountA) => {
        const newPosition = {
          positionId: Number(positionId),
          user,
          stopTick: parseInt(stopTick, 16),
          poolAddress,
          amount: Math.round(
            Number(ethers.utils.formatUnits(amountA, 'ether')),
          ),
          direction: 'buy',
        };
        console.log(JSON.stringify(newPosition));

        await this.queueService.openPosition(newPosition);

        this.gatewayFactory.createGateway(poolAddress, this.queueService);
        console.log(`Created new gateway : ${poolAddress}`);
      },
    );

    contract.on(
      'SellPositionOpened',
      async (positionId, user, stopTick, poolAddress, amountB) => {
        const newPosition = {
          positionId: Number(positionId),
          user,
          stopTick: parseInt(stopTick, 16),
          poolAddress,
          amount: Math.round(
            Number(ethers.utils.formatUnits(amountB, 'ether')),
          ),
          direction: 'sell',
        };
        console.log(JSON.stringify(newPosition));

        await this.queueService.openPosition(newPosition);
      },
    );

    contract.on('PositionClosed', (positionId) => {
      const closePosition = {
        positionId: Number(positionId),
      };
      console.log(JSON.stringify(closePosition));

      this.queueService.changePositionStatus(closePosition.positionId);
    });
  }
}
