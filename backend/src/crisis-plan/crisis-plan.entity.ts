import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class CrisisPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column()
  triggerCondition: string; 

  @Column()
  action: string; 
}
