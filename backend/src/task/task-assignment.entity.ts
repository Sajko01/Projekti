import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Task } from './task.entity';
import { Machine } from 'src/machine/machine.entity';
import { Worker } from 'src/worker/worker.entity';
import { Material } from 'src/material/material.entity';


@Entity()
export class TaskAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Task, task => task.assignments, { onDelete: 'CASCADE' })
  task: Task;

  @ManyToOne(() => Worker, { nullable: true })
  worker: Worker;

  @ManyToOne(() => Machine, { nullable: true })
  machine: Machine;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;


}
