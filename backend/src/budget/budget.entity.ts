import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Budget {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float')
  amountAllocated: number;

  @Column('float')
  amountUsed: number;

  @Column()
  currency: string;
}
