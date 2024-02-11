import {
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
} from '@nestjs/websockets';
import { Contract, ethers, getDefaultProvider } from 'ethers';
import { Server } from 'socket.io';
import { QueueService } from 'src/common/services/queue.service';
import { abi_pool } from 'src/contracts/pool/abi';

@WebSocketGateway()
export class DynamicPoolGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly poolAddress: string,
    private readonly queueService: QueueService,
  ) {}

  afterInit() {
    this.initializeWebSocket();
    console.log(`WebSocket Gateway successfully init for: ${this.poolAddress}`);
  }
  provider = getDefaultProvider(process.env.ALCHEMY_WS_URL);
  contract = new Contract(this.poolAddress, abi_pool, this.provider);

  initializeWebSocket() {
    console.log(`Initializing WebSocket for pool address: ${this.poolAddress}`);
    this.contract.on(
      'Swap',
      (sender, recipient, amount0, amount1, sqrtPriceX96, liquidity, tick) => {
        const swapEvent = {
          from: sender,
          to: recipient,
          amount0: ethers.utils.formatEther(amount0),
          amount1: ethers.utils.formatEther(amount1),
          sqrtPriceX96: ethers.utils.formatEther(sqrtPriceX96),
          liquidity: ethers.utils.formatEther(liquidity),
          tick: parseInt(tick, 16),
        };
        const swap = {
          poolAddress: this.poolAddress,
          tick: swapEvent.tick,
        };
        console.log('SWAP', swap);

        this.queueService.addEventToSwapEventQueue(swap);
      },
    );
  }
}
