import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Position } from './models/position.model';
import { Pools } from 'src/common/models/poolsTable.model';
import { CreatePositionDto, CreatePositionDtoType } from 'src/common/types';
import { z } from 'zod';
import { Op } from 'sequelize';
import { ethers } from 'ethers';
import { abi_position } from 'src/contracts/positionManager/abi';
import { ConfigService } from '@nestjs/config';
import { RoundRobinService } from './roundRobin.service';

@Injectable()
export class PositionsService {
  private readonly contract = new ethers.Contract(
    this.configService.get<string>('PM_CONTRACT_ADDRESS'),
    abi_position,
    // this.wallet,
  );
  constructor(
    @InjectModel(Position)
    private readonly positionsRepository: typeof Position,
    @InjectModel(Pools)
    private readonly poolsRepository: typeof Pools,
    private configService: ConfigService,
    private roundRobin: RoundRobinService,
  ) {}

  async createPosition(
    positionInput: CreatePositionDtoType,
  ): Promise<Position> {
    try {
      const position = CreatePositionDto.parse(positionInput);
      return await this.positionsRepository.create(position);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error(error.errors);
        throw new Error('Validation error');
      }
      throw error;
    }
  }

  async getPositions() {
    return await this.positionsRepository.findAll();
  }

  async changePositionStatus(positionId: number): Promise<void> {
    const position = await this.positionsRepository.findOne({
      where: { positionId },
    });

    if (position && position.status === 'opened') {
      await position.update({ status: 'closed' });
    }
  }

  async getPools(): Promise<Pools[]> {
    return this.poolsRepository.findAll();
  }

  async findPositionsToClose(
    poolAddress: string,
    tick: number,
  ): Promise<Position[]> {
    return await this.positionsRepository.findAll({
      where: {
        poolAddress: {
          [Op.eq]: poolAddress,
        },
        status: {
          [Op.eq]: 'opened',
        },
        stopTick: {
          // add conditions to search positions depending on 'buy/sell'
          [Op.lt]: tick,
        },
      },
      order: [['createdAt', 'ASC']],
      raw: true,
      limit: 10, // butch
    });
  }

  async closePosition(
    positionId: string,
  ): Promise<ethers.providers.TransactionReceipt> {
    console.log(positionId);
    try {
      const signer = this.roundRobin.getNextSigner();
      const contractWithSigner = this.contract.connect(signer);

      // console.log(
      //   'Wallet Balance:',
      //   ethers.utils.formatEther(
      //     await this.provider.getBalance(this.wallet.address),
      //   ),
      // );

      const transaction = await contractWithSigner.closePosition(positionId);
      return await transaction.wait();
    } catch (error) {
      console.error('Error close position:', (error as Error).message);
      throw error;
    }
  }
}
