import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Task } from 'src/task/task.entity';

@Entity()
export class Worker {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

 @Column({ default: 'CNC' })
type: string;


  @Column({ type: 'int' })
  skillLevel: number;


  @Column({ default: true })
  availability: boolean;


  @Column({ type: 'float', default: 8 })
  capacityPerDay: number;


  @Column({ type: 'float', default: 2 })
  maxOvertimeHours: number;


  @Column({ type: 'float', default: 10 }) 
  hourlyRate: number;





  @Column({ type: 'float', nullable: true })
  weekendHourlyRate: number;


  @Column({ type: 'float', nullable: true })
  overTimeHourlyRate: number;


  @ManyToOne(() => Task, (task) => task.assignedWorkers, { nullable: true })

@JoinColumn({ name: 'currentTaskId' }) 
currentTask: Task;
}
