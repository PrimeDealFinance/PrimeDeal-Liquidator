import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Position } from './models/position.model';
import { PoolsTable } from 'src/common/models/poolsTable.model';
import { CreatePositionDto, CreatePositionDtoType } from 'src/common/types';
import { z } from 'zod';

@Injectable()
export class PositionsService {
  constructor(
    @InjectModel(Position)
    private readonly positionsRepository: typeof Position,
    @InjectModel(PoolsTable)
    private readonly poolsRepository: typeof PoolsTable,
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

  async getPools(): Promise<PoolsTable[]> {
    return this.poolsRepository.findAll();
  }
}
