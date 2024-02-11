import { Column, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'Positions',
})
export class Position extends Model<Position> {
  @Column
  user: string;
  @Column
  positionId: number;
  @Column
  stopTick: number;
  @Column
  amount: number;
  @Column
  poolAddress: string;
  @Column
  direction: string;
  @Column({
    defaultValue: 'opened',
  })
  status: string;
}
