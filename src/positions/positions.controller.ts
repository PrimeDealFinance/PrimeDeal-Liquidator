import { Body, Controller, Post } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller('positions')
export class PositionsController {
  constructor(private readonly positionService: PositionsService) {}

  @ApiExcludeEndpoint()
  @Post()
  createPosition(@Body() position: CreatePositionDto) {
    return this.positionService.createPosition(position);
  }
}
