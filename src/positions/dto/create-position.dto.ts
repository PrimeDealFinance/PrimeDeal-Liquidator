import { IsNumber, IsString } from 'class-validator';

export class CreatePositionDto {
  @IsString({ message: 'Value must be string' })
  readonly user: string;
  @IsNumber({}, { message: 'Value must be number' })
  readonly positionId: number;
  @IsNumber({}, { message: 'Value must be number' })
  readonly stopTick: number;
  @IsString({ message: 'Value must be string' })
  readonly poolAddress: string;
  @IsNumber({}, { message: 'Value must be number' })
  readonly amountA: number;
  @IsString({ message: 'Value must be string' })
  readonly direction: string;
}
