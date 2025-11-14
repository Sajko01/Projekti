import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable, ManyToOne } from 'typeorm';
import { Worker } from 'src/worker/worker.entity';
import { Machine } from 'src/machine/machine.entity';
import { Method } from 'src/method/method.entity';
import { Material, TaskMaterial } from '../material/material.entity';
import { TaskAssignment } from './task-assignment.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 'CNC' })
type: string;


   @Column({
    type: 'enum',
    enum: ['planned', 'in-progress', 'delayed', 'completed','blocked-by-budget', 'blocked-by-delayed'],
    default: 'planned',
  })
  status: 'planned' | 'in-progress' | 'delayed' | 'completed'| 'blocked-by-budget'| 'blocked-by-delayed';


  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  deadline: Date;

  @Column({ type: 'int', default: 3 })
  priority: number;



  @Column('float',{ nullable: true })
 totalCost: number;

  @Column('float',{ nullable: true })
  pricePerProduct: number;

 
  @Column('float', { default: 0 })
revenue: number;



  @Column('int', { default: 0 })
  totalProducts: number;


  @Column({ type: 'float', default: 0 })
  producedProducts: number;


  @Column('float', { default: 1 })
hoursPerProduct: number;

  @Column({ type: 'int', nullable: true })
delayDays: number; 



  @ManyToOne(() => Method, (method) => method.tasks, { eager: true })
  method: Method;

              @OneToMany(() => TaskMaterial, tm => tm.task, { cascade: true, eager: true })
taskMaterials: TaskMaterial[];



  @OneToMany(() => Worker, (worker) => worker.currentTask, { cascade: true })
  assignedWorkers: Worker[];

  
  @OneToMany(() => Machine, (machine) => machine.currentTask, { cascade: true })
  assignedMachines: Machine[];


  @OneToMany(() => TaskAssignment, (assignment) => assignment.task)
  assignments: TaskAssignment[];
}
