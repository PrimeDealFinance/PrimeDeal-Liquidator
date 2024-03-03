import { Column, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'Pools',
})
export class Pools extends Model<Pools> {
  @Column
  poolAddress: string;
  @Column({
    defaultValue: '0xeC617F1863bdC08856Eb351301ae5412CE2bf58B',
  })
  tokenAcontract: string;
  @Column({
    defaultValue: '0xeC617F1863bdC08856Eb351301ae5412CE2bf58B',
  })
  tokenBcontract: string;
  @Column({
    defaultValue: 'ETH',
  })
  tokenAsymbol: string;
  @Column({
    defaultValue: 'USDT',
  })
  tokenBsymbol: string;
  @Column({
    defaultValue: true,
  })
  isActive: boolean;
}
