import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { contract, address } from '../contracts/pool/contract';
import { ethers } from 'ethers';
import { QueueService } from 'src/common/services/queue.service';

//we dont use it - we use dynamically opened gateways - but its here for example
@Injectable()
@WebSocketGateway()
export class PoolGateway implements OnGatewayInit {
  constructor(private readonly queueService: QueueService) {}

  @WebSocketServer()
  server: Server;

  afterInit() {
    this.initializeWebSocket();
  }

  async initializeWebSocket() {
    console.log('START pool');

    contract.on(
      'Swap',
      (sender, recipient, amount0, amount1, sqrtPriceX96, liquidity, tick) => {
        const event = {
          from: sender,
          to: recipient,
          amount0: ethers.utils.formatEther(amount0),
          amount1: ethers.utils.formatEther(amount1),
          sqrtPriceX96: ethers.utils.formatEther(sqrtPriceX96),
          liquidity: ethers.utils.formatEther(liquidity),
          tick: parseInt(tick, 16),
        };

        const swapEvent = {
          address,
          tick: event.tick,
        };
        console.log('SWAP', swapEvent);

        this.queueService.addEventToSwapEventQueue(swapEvent);
      },
    );
  }
}
