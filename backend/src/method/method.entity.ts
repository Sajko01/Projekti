import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Task } from 'src/task/task.entity';

@Entity()
export class Method {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('float')
  efficiencyFactor: number;

  @OneToMany(() => Task, (task) => task.method)
  tasks: Task[];
}
