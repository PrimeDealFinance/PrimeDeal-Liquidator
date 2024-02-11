import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { SWAP_EVENT, TRANSACTION_QUEUE } from '../constants';
import { Position } from '../../positions/models/position.model';
import { Op } from 'sequelize';

@Processor(SWAP_EVENT)
export class SwapEventConsumer {
  constructor(@InjectQueue(TRANSACTION_QUEUE) private transactionQueue: Queue) {
    // this.initializeEventListeners();
  }
  // ** we dont use this, it's here only for example - how u can log job proccess, we use BullBoard Dashboard **
  // private initializeEventListeners() {
  //   this.transactionQueue.on('completed', (job, result) => {
  //     console.log(
  //       `Job completed! Job ID: ${job.id}, Result: ${JSON.stringify(result)}`,
  //     );
  //   });
  // }

  @Process('catchSwap')
  async handleFindPosition(job: Job) {
    try {
      const swapEvent = job.data;
      const results = await Position.findAll({
        where: {
          poolAddress: {
            [Op.eq]: swapEvent.poolAddress, // looking for poolAddress
          },
          status: {
            [Op.eq]: 'opened',
          },
          // tickLower: {
          //   [Op.gt]: Tick2 // Tick1 больше чем Tick2
          // }
        },
        order: [['createdAt', 'ASC']],
        raw: true,
        // limit: 3,
      });

      if (results && results.length > 0) {
        for (const position of results) {
          await this.transactionQueue.add('makeTx', {
            positionId: position.positionId,
          });
        }
        return {
          status: `we have ${results.length} positions to close and we make jobs for them in transaction queue!`,
        };
      } else {
        return {
          status: 'we dont have any positions to close',
        };
      }
    } catch (error) {
      console.error('Error while job', job.id, error);
      throw error;
    }
  }
}
