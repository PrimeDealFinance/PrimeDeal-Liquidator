import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KeepAliveParams } from 'src/common/types';
import { QueuesService } from 'src/queues/queues.service';

@Injectable()
export class WsKeepAliveService {
  constructor(
    private readonly aliveQueue: QueuesService,
    private readonly label: string,
    private configService: ConfigService,
  ) {}
  keepAlive({
    provider,
    onDisconnect,
    expectedPongBack = this.configService.get<number>('PONG'),
    checkInterval = this.configService.get<number>('PING'),
  }: KeepAliveParams) {
    let pingTimeout: NodeJS.Timeout | null = null;
    let keepAliveInterval: NodeJS.Timeout | null = null;

    provider._websocket.on('open', () => {
      keepAliveInterval = setInterval(() => {
        provider._websocket.ping();
        console.log(`Ping ${this.label} ` + new Date().toISOString());
        pingTimeout = setTimeout(() => {
          provider._websocket.terminate();
        }, expectedPongBack);
      }, checkInterval);
    });

    provider._websocket.on('close', (err: any) => {
      if (keepAliveInterval) clearInterval(keepAliveInterval);
      if (pingTimeout) clearTimeout(pingTimeout);
      onDisconnect(err);
    });

    provider._websocket.on('pong', () => {
      if (pingTimeout) clearTimeout(pingTimeout);
      this.aliveQueue.addPong(new Date().toISOString());
    });
  }
}
