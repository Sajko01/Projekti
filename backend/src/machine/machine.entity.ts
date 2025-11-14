import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Task } from 'src/task/task.entity';

@Entity()
export class Machine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

@Column({ default: 'CNC' })
type: string;



  @Column({ type: 'float', default: 1.0 })
  efficiency: number;


  @Column({ type: 'float', default: 8 })
  capacityPerDay: number;


  @Column({ type: 'int', default: 1 }) 
maxWorkers: number;

  @Column({ type: 'int', default: 1 })
  minWorkers: number;


  @Column({ default: true })
  availability: boolean;


  @Column({ type: 'float', default: 2 })
  maxOvertimeHours: number;



  @ManyToOne(() => Task, (task) => task.assignedMachines, { nullable: true })
  @JoinColumn({ name: 'currentTaskId' })
  currentTask: Task | null;
}
