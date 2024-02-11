import { Column, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'PoolsTable',
})
export class PoolsTable extends Model<PoolsTable> {
  @Column({
    defaultValue: '0xeC617F1863bdC08856Eb351301ae5412CE2bf58B',
  })
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
    defaultValue: '0xeC617F1863bdC08856Eb351301ae5412CE2bf58B',
  })
  tokenAsymbol: string;
  @Column({
    defaultValue: '0xeC617F1863bdC08856Eb351301ae5412CE2bf58B',
  })
  tokenBsymbol: string;
}
