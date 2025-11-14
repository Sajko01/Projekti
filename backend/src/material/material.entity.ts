import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne, Index } from 'typeorm';
import { Task } from '../task/task.entity';

@Entity()
@Index('IDX_MATERIAL_NAME_UNIQUE', ['name'], { unique: true })
export class Material {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column({ type: 'citext', unique: true })
   @Column()
  name: string;

  @Column('float')
  quantityAvailable: number;

  @Column('float',{nullable:true})
  price: number;

  @Column()
  unit: string;


}


@Entity()
export class TaskMaterial {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Task, task => task.taskMaterials, { onDelete: 'CASCADE' })
  task: Task;

  @ManyToOne(() => Material, { eager: true })
  material: Material;

  @Column('float')
  quantityUsed: number; 
}