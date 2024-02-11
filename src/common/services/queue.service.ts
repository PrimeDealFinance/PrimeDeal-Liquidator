import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { POSITION_QUEUE, SWAP_EVENT, TRANSACTION_QUEUE } from '../constants';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue(POSITION_QUEUE) private position: Queue,
    @InjectQueue(SWAP_EVENT) private swapEvent: Queue,
    @InjectQueue(TRANSACTION_QUEUE) private transaction: Queue,
  ) {
    //this.initializeEventListeners();
  }
  // ** we dont use this, it's here only for example - how u can log job proccess, we use BullBoard Dashboard **
  // private initializeEventListeners() {
  //   this.position.on('completed', (job, result) => {
  //     console.log(
  //       `Recording open position in DB! Job ID: ${
  //         job.id
  //       }, Result: ${JSON.stringify(result)}`,
  //     );
  //   });
  // }

  async openPosition(eventData: any) {
    return await this.position.add('openPosition', eventData);
  }

  async changePositionStatus(positionId: number) {
    return await this.position.add('changePositionStatus', {
      positionId,
    });
  }

  async addEventToSwapEventQueue(eventData: any) {
    return await this.swapEvent.add('catchSwap', eventData);
  }
}
