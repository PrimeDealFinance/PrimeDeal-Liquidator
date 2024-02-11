// import { Injectable } from '@nestjs/common';
// import { DynamicPoolGateway } from './DynamicPoolGateway';

import { Injectable } from '@nestjs/common';
import { DynamicPoolGateway } from './DynamicPoolGateway';
import { QueueService } from 'src/common/services/queue.service';

@Injectable()
export class GatewayFactory {
  private gateways: Map<string, DynamicPoolGateway> = new Map();

  createGateway(
    poolAddress: string,
    queueService: QueueService,
  ): DynamicPoolGateway {
    if (!this.gateways.has(poolAddress)) {
      const gateway = new DynamicPoolGateway(poolAddress, queueService);
      this.gateways.set(poolAddress, gateway);
      gateway.initializeWebSocket(); // init WebSocket and subscribe on events
    }
    return this.gateways.get(poolAddress);
  }
}
