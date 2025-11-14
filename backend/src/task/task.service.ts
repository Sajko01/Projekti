import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThanOrEqual, MoreThan, MoreThanOrEqual, Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/createTask.dto';
import { UpdateTaskDto } from './dto/updateTask.dto';
import { Worker } from '../worker/worker.entity';
import { Machine } from '../machine/machine.entity';
import { MachineService } from 'src/machine/machine.service';
import { BudgetService } from 'src/budget/budget.service';
import { WorkerService } from 'src/worker/worker.service';
import { CrisisPlan } from 'src/crisis-plan/crisis-plan.entity';
import { numberOfDays } from 'src/utils';
import { TaskAssignment } from './task-assignment.entity';
import { TaskAssignmentService } from './task-assignment.service';
import { Worker as WorkerEntity } from 'src/worker/worker.entity';
import { DataSource } from 'typeorm';
import { Between } from 'typeorm';
import dayjs from 'dayjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Budget } from 'src/budget/budget.entity';
import { Material, TaskMaterial } from 'src/material/material.entity';
import { Method } from 'src/method/method.entity';



@Injectable()
export class TaskService {

    private readonly logger = new Logger(TaskService.name);
  constructor(
    private readonly dataSource: DataSource, 
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,

    @InjectRepository(Worker)
    private workerRepository: Repository<Worker>,

    
    @InjectRepository(TaskMaterial)
    private taskMaterialRepository: Repository<TaskMaterial>,

    @InjectRepository(Machine)
    private machineRepository: Repository<Machine>,

     @InjectRepository(Material)
    private materialRepository: Repository<Material>,

    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,

    @InjectRepository(CrisisPlan)
    private crisisPlanRepository: Repository<CrisisPlan>,

     @InjectRepository(TaskAssignment)
        private taskAssignmentRepository: Repository<TaskAssignment>,

    private readonly workerService: WorkerService,
    private readonly machineService: MachineService,
    private readonly budgetService: BudgetService,
     private readonly taskAssignmentService: TaskAssignmentService 

  ) {}

  

async create(createTaskDto: CreateTaskDto): Promise<Task> {
  const { materials, ...taskData } = createTaskDto;


  const task = this.taskRepository.create(taskData);
  await this.taskRepository.save(task);

  if (materials && materials.length > 0) {
    const taskMaterials: TaskMaterial[] = [];

    for (const mat of materials) {

      let material = await this.materialRepository
    .createQueryBuilder("material")
    .where("LOWER(material.name) = LOWER(:name)", { name: mat.name })
    .getOne();


      if (!material) {
        material = this.materialRepository.create({
          name: mat.name,
          quantityAvailable: 0,
          unit: 'pcs',
        });
        await this.materialRepository.save(material);
      }

   
    //  material.quantityAvailable -= mat.quantity; 
      await this.materialRepository.save(material);

      const tm = this.taskMaterialRepository.create({
        task,
        material,
        quantityUsed: mat.quantity,
      });

      await this.taskMaterialRepository.save(tm);
      taskMaterials.push(tm);
    }

    task.taskMaterials = taskMaterials;
    await this.taskRepository.save(task);
  }

  return task;
}




  async findAll(): Promise<any[]> {
  const tasks = await this.taskRepository.find({ relations: ['method'] });

  return tasks.map(task => ({
    ...task,
    methodId: task.method?.id ?? null,
    method: undefined, 
  }));
}


 async findOne(id: number): Promise<Task> {
  const task = await this.taskRepository.findOne({ where: { id } });
  if (!task) throw new NotFoundException(`Task ${id} not found`);
  return task;
}



async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task|null> {
  const { materials, ...taskData } = updateTaskDto;


  const task = await this.taskRepository.findOne({
    where: { id },
    relations: ['taskMaterials', 'taskMaterials.material'], 
  });

  if (!task) {
    throw new NotFoundException(`Task with ID ${id} not found`);
  }

 
  Object.assign(task, taskData);
  await this.taskRepository.save(task);


  if (materials && materials.length > 0) {

    await this.taskMaterialRepository.delete({ task: { id } });

  
    for (const mat of materials) {
  
        let material = await this.materialRepository
    .createQueryBuilder("material")
    .where("LOWER(material.name) = LOWER(:name)", { name: mat.name })
    .getOne();

      if (!material) {
        material = this.materialRepository.create({
          name: mat.name,
          quantityAvailable: 10000000, 
          unit: 0 || 'pcs',
          price: 0|| 0,
        });
        await this.materialRepository.save(material);
      }


      const taskMaterial = this.taskMaterialRepository.create({
        task,
        material,
        quantityUsed: mat.quantity, 
      });
      await this.taskMaterialRepository.save(taskMaterial);
    }
  }


  return await this.taskRepository.findOne({
    where: { id },
    relations: ['taskMaterials', 'taskMaterials.material'],
  });
}




  async remove(id: number): Promise<void> {
    await this.taskRepository.delete(id);
  }


  async addWorker(taskId: number, workerId: number): Promise<Task> {
    const task = await this.findOne(taskId);
    const worker = await this.workerRepository.findOne({ where: { id: workerId }, relations: ['assignedTasks'] });
    if (!worker) throw new NotFoundException(`Worker ${workerId} not found`);
    task.assignedWorkers = [...(task.assignedWorkers || []), worker];
    return this.taskRepository.save(task);
  }


  async addMachine(taskId: number, machineId: number): Promise<Task> {
    const task = await this.findOne(taskId);
    const machine = await this.machineRepository.findOne({ where: { id: machineId }, relations: ['assignedTasks'] });
    if (!machine) throw new NotFoundException(`Machine ${machineId} not found`);
    task.assignedMachines = [...(task.assignedMachines|| []), machine];
    return this.taskRepository.save(task);
  }






async checkAndApplyCrisisForAllTasks(): Promise<{ messages: string[] }| null> {
  console.log(`📊 [CRISIS] Pokrećem proveru kriznih planova...`);
  const messages: string[] = [];

  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
 
    const crisisPlans = await this.crisisPlanRepository.find();
    console.log(`📁 [CRISIS] Učitano ${crisisPlans.length} kriznih planova iz baze.`);

    if (crisisPlans.length === 0) {
      console.warn(`⚠️ [CRISIS] Nema definisanih kriznih planova — ništa se neće izvršiti.`);
      return null;
    }

    const lowestPriorityTask = await this.taskRepository.findOne({
      where: { status: In(['planned', 'in-progress', 'delayed']) },

       relations: ['method', 'assignedWorkers', 'assignedMachines'],
      order: { priority: 'DESC' },
    });

    if (lowestPriorityTask) {
      console.log(`\n🔎 [CRISIS] Proveravam budžet za task ID: ${lowestPriorityTask.id} | Prioritet: ${lowestPriorityTask.priority}`);

      for (const plan of crisisPlans) {
        const budgetMatch = plan.triggerCondition.match(/budget\s*<\s*(\d+(\.\d+)?)/i);
        if (budgetMatch) {
          const threshold = parseFloat(budgetMatch[1]);
          const currentBudget = await this.budgetService.returnBudget();
          console.log(`   💰 [BUDGET] Dostupno: ${currentBudget} | Prag: ${threshold} | Task zahteva: ${lowestPriorityTask.totalCost}`);

          

          if (currentBudget && currentBudget < threshold) {
            console.warn(`   ⚠️ [CRISIS] Budžet rizican! Aktiviram akciju: ${plan.action}`);
            await this.executeCrisisAction(lowestPriorityTask, plan.action, `Budžet ispod praga (${threshold})`, messages);
            //break; 
          }
        }
      }
    } else {
      console.log(`📋 [CRISIS] Nema aktivnih zadataka za proveru budžeta.`);
    }


    const allActiveTasks = await this.taskRepository.find({
      where: { status: In(['planned', 'in-progress', 'delayed','blocked-by-budget']) },
      relations: ['method'],
    });

    console.log(`\n📊 [CRISIS] Proveravam metode i kašnjenja za ${allActiveTasks.length} aktivnih zadataka...`);

    for (const task of allActiveTasks) {
      console.log(`\n🔎 [TASK] ID: ${task.id} | Naziv: ${task.name} | Prioritet: ${task.priority}`);
      let crisisTriggered = false;

      for (const plan of crisisPlans) {
        const methodMatch = plan.triggerCondition.match(/method\s*=\s*(\d+(\.\d+)?)/i);
        const delayMatch = plan.triggerCondition.match(/delay\s*>\s*(\d+)/i);

        if (methodMatch && task.method) {
          const methodThreshold = parseFloat(methodMatch[1]);
          const delayThreshold = delayMatch ? parseInt(delayMatch[1]) : 0;

          console.log(`   🔬 [METHOD] Efikasnost: ${task.method.efficiencyFactor} | Prag: ${methodThreshold}`);
          console.log(`   ⏱️ [DELAY] Kašnjenje: ${task.delayDays ?? 0} dana | Prag: ${delayThreshold}`);

          if (
            task.method.efficiencyFactor === methodThreshold &&
            (task.delayDays ?? 0) > delayThreshold
          ) {
            console.warn(`   ⚠️ [CRISIS] Uslov ispunjen! Aktiviram akciju: ${plan.action}`);
            await this.executeCrisisAction(task, plan.action, `Efikasnost metode ispod ${methodThreshold}`, messages);
            crisisTriggered = true;
            break;
          }
        }



         const budgetUnblockMatch = plan.triggerCondition.match(/budget\s*>\s*(\d+(\.\d+)?)/i);
        if (budgetUnblockMatch && task.status==='blocked-by-budget') {
          const threshold = parseFloat(budgetUnblockMatch[1]);
          const currentBudget = await this.budgetService.returnBudget();
          if(currentBudget-task.totalCost>threshold){
          console.log(`   💰 [BUDGET] Dostupno: ${currentBudget} | Da li je dostupno toliko budzeta: ${threshold} | Task zahteva: `);

            console.warn(`   ⚠️ [CRISIS] Budžet rizican! Aktiviram akciju: ${plan.action}`);
            await this.executeCrisisAction(task, plan.action, `Budžet - cena Taska je veca od praga (${threshold})pa se moze odblokirati proces" ${task.id}!`, messages);
            break; 
          }
        }
      }

      if (!crisisTriggered) {
        console.log(`   ✅ [TASK] Nema kriznih uslova za ovaj zadatak.`);
      }
    }

   
    await queryRunner.commitTransaction();
    console.log(`\n✅ [CRISIS] Provera svih kriznih uslova završena.`);

  } catch (error) {
    console.error(`❌ [CRISIS] Greška prilikom provere:`, error);
    await queryRunner.rollbackTransaction();
  } finally {
    await queryRunner.release();
  }
   return { messages };
}

private async executeCrisisAction(task: Task, action: string, reason: string, messages:string[]): Promise<void> {
  let act='';
   if(action==='unblock-by-budget')
    act='odblokiraj zbog budžeta'
  if(action==='block-by-budget')
    act='blokiraj zbog budžeta'
  if(action==='block-by-delayed')
    act='blokiraj zbog kašnjenja i metode 4'
  if(action==='notify')
    act='obaveštenje'
  console.log(`🚨 [AKCIJA] Izvršavam akciju "${act}" za Task #${task.id}`);
  messages.push(`🚨 Izvršavam akciju "${act}" za zadatak sa ID-jem:${task.id}`);

  switch (action) {
    case 'unblock-by-budget':
      task.status = 'planned';
      console.log(`   🚫 Budzet porastao, moze se odblokirati neki od zadataka, ako su zainteresovani'`);
       messages.push(`🚫 Zadatak sa ID-jem:${task.id} odblokiran jer je budžet porastao, novo stanje: 'planiran'`);
      break;

    case 'block-by-budget':
      task.status = 'blocked-by-budget';
      console.log(`   💰 Status zadatka #${task.id} postavljen na 'blocked-by-budget'`);
          messages.push(`💰 Zadatak sa ID-jem:${task.id} blokiran zbog nedostatka budžeta, novo stanje: 'blokiran zbog budžeta'`);
      break;

    case 'block-by-delayed':
      if(task.producedProducts>(task.totalProducts/2)){
          console.log(` Bez obizra na kasnjenje nije moguce blokirati zadatak #${task.id} jer je proizvedeno vise od pola proizvoda!'`);
        messages.push(`⏱️ Zadatak sa ID-jem:${task.id} nije moguće blokirati zbog kašnjenja jer je više od pola proizvoda proizvedeno`);
      }
        else{

      task.status = 'blocked-by-delayed';
      console.log(`   ⏱️ Status zadatka #${task.id} postavljen na 'blocked-by-delayed'`);
              messages.push(`⏱️ Zadatak sa ID-jem:${task.id} blokiran zbog kašnjenja, novo stanje: 'blokiran zbog kašnjenja'`);
      
        }
       
      break;



    case 'notify':
      console.log(`   Budzet je pao na rizicnu vrednost, ne uzimati poslove sa visokim rizikom budzeta(150.000E)!`);
      console.log(`   📩 Samo notifikacija – status zadatka nije promenjen`);
      messages.push(`📩 Samo obaveštenje za zadatak sa ID-jem:${task.id}, stanje nije promenjeno. Budžet je pao na rizičnu vrednost!`);
      break;

    default:
      console.warn(`    Nepoznata akcija: ${action}. Nema promena statusa.`);
        messages.push(` Nepoznata akcija za zadatak sa ID-jem:${task.id}, nema promena stanja`);
      break;
  }


  await this.taskRepository.save(task);
  console.log(`    Promene su uspešno sačuvane u bazi.`);
    messages.push(`Promene za zadatak sa ID-jem:${task.id} sačuvane u bazi`);

  await this.sendCrisisNotification(task, reason);
}

private calculateDelayDays(endDate: Date): number {
  if (!endDate) return 0;
  const now = new Date();
  return Math.floor((now.getTime() - new Date(endDate).getTime()) / (1000 * 60 * 60 * 24));
}





private async sendCrisisNotification(task: Task, message: string): Promise<void> {

  this.logger.warn(` Krizno obaveštenje za zadatak ${task.id}: ${message}`);
}


async scheduleTasks(): Promise<void> {
  console.log('📅 Scheduling tasks...');

  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const tasks = await this.taskRepository.find({
      where: { status: In(['planned', 'delayed', 'in-progress']) },
      order: { priority: 'ASC' },
      relations: ['assignedWorkers', 'assignedMachines'],
    });
    console.log(`📋 Found ${tasks.length} planned tasks`);

    const tasksByType: Record<string, Task[]> = {};

    for (const task of tasks) {
      task.assignedWorkers = [];
      task.assignedMachines = [];

      const type = task.type || 'other';
      if (!tasksByType[type]) tasksByType[type] = [];
      tasksByType[type].push(task);
    }

    for (const [type, taskGroup] of Object.entries(tasksByType)) {
      console.log(`\n🛠️ Scheduling tasks for TYPE: "${type.toUpperCase()}"`);

      let groupAvailableDate = new Date();

      for (const task of taskGroup) {
        console.log(`\n🔎 Processing Task ${task.id}: ${task.name}`);

        await queryRunner.manager.delete(TaskAssignment, { task: { id: task.id } });
        console.log(`🗑️ Deleted previous TaskAssignments for Task ${task.id}`);

        const taskStart = new Date(groupAvailableDate);

        const availableWorkers = (await this.workerService.getAvailableWorkersForDay(taskStart, queryRunner.manager))
          .filter(w => w.type === task.type);
        const availableMachines = (await this.machineService.getAvailableMachinesForDay(taskStart, queryRunner.manager))
          .filter(m => m.type === task.type);

        console.log(`👷 Available workers: ${availableWorkers.map(w => w.name)}`);
        console.log(`🤖 Available machines: ${availableMachines.map(m => m.name)}`);

        if (availableWorkers.length < 1 || availableMachines.length < 1) {
          task.status = 'delayed';
          await queryRunner.manager.save(task);
          console.warn(`⚠️ Task ${task.id} delayed — insufficient resources.`);
          continue;
        }

        let assignmentMade = false;

    
        let totalWorkers = 0;
        let totalMaxWorkers = 0;
        let totalSkill = 0;
        const machinesWithAssignedWorkers: { machine: Machine; workers: Worker[] }[] = [];

        for (const machine of availableMachines) {
          const assignedWorkers = availableWorkers.splice(0, Math.min(machine.maxWorkers, availableWorkers.length));
          if (assignedWorkers.length === 0) break;

          totalWorkers += assignedWorkers.length;
          totalMaxWorkers += machine.maxWorkers;
          totalSkill += assignedWorkers.reduce((sum, w) => sum + (w.skillLevel || 1), 0);

          machinesWithAssignedWorkers.push({ machine, workers: assignedWorkers });
          console.log(`   🛠️ Machine ${machine.name} assigned workers: ${assignedWorkers.map(w => w.name).join(', ')}`);
        }

        if (machinesWithAssignedWorkers.length === 0) {
          task.status = 'delayed';
          await queryRunner.manager.save(task);
          console.warn(`⚠️ Task ${task.id} delayed — no workers distributed.`);
          continue;
        }

        const avgSkillAll = totalSkill / totalWorkers;
        const fullCapacitySkill = 2;
        const fullCapacityHours = (task.totalProducts - task.producedProducts) * task.hoursPerProduct;

        const workerCountFactorAll = totalWorkers / totalMaxWorkers;
        const skillFactorAll = avgSkillAll / fullCapacitySkill;
        const efficiencyFactorAll = workerCountFactorAll * skillFactorAll || 0.0001;
        const totalHoursAll = fullCapacityHours / efficiencyFactorAll;

        console.log(`   📊 Task ${task.id} calculation:`);
        console.log(`      Total workers: ${totalWorkers}`);
        console.log(`      Avg skill: ${avgSkillAll.toFixed(2)}`);
        console.log(`      Worker count factor: ${workerCountFactorAll.toFixed(2)}`);
        console.log(`      Skill factor: ${skillFactorAll.toFixed(2)}`);
        console.log(`      Efficiency factor: ${efficiencyFactorAll.toFixed(4)}`);
        console.log(`      Total hours required: ${totalHoursAll.toFixed(2)}`);

        let currentDayAll = new Date(taskStart);
        let hoursRemainingAll = totalHoursAll;

        while (hoursRemainingAll > 0) {
          if (currentDayAll.getDay() !== 0 && currentDayAll.getDay() !== 6) {
            const capacity = Math.min(...machinesWithAssignedWorkers.map(mw => mw.machine.capacityPerDay));
            hoursRemainingAll -= capacity*machinesWithAssignedWorkers.length;//zimena
            console.log(`      🕒 Working on ${currentDayAll.toDateString()}, reducing ${capacity*machinesWithAssignedWorkers.length}h, remaining ${hoursRemainingAll.toFixed(2)}h`);
          }
          if (hoursRemainingAll > 0) currentDayAll.setDate(currentDayAll.getDate() + 1);
        }

        const sharedTaskEnd = new Date(currentDayAll);
        console.log(`📅 Zajednički END za sve mašine: ${sharedTaskEnd.toDateString()}`);
  
        for (const { machine, workers } of machinesWithAssignedWorkers) {
          const taskEnd = sharedTaskEnd;
          const isTaskStartingToday = taskStart.toDateString() === new Date().toDateString();

          console.log(`\n   ✨ Assigning Task ${task.id} to Machine ${machine.name} and workers: ${workers.map(w => w.name).join(', ')}`);

          for (const worker of workers) {
            await queryRunner.manager.save(TaskAssignment, {
              task,
              worker,
              startDate: taskStart,
              endDate: taskEnd,
            });
            console.log(`      👷‍♂️ Worker ${worker.name} assignment saved for ${isTaskStartingToday ? "TODAY" : "FUTURE"}`);

            if (isTaskStartingToday) {
              await queryRunner.manager.update(Worker, { id: worker.id }, { currentTask: { id: task.id } });
              console.log(`         🔄 Worker ${worker.name} currentTask updated`);
            }
          }

          await queryRunner.manager.save(TaskAssignment, {
            task,
            machine,
            startDate: taskStart,
            endDate: taskEnd,
          });
          console.log(`      🤖 Machine ${machine.name} assignment saved with shared END date`);

          if (isTaskStartingToday) {
            await queryRunner.manager.update(Machine, { id: machine.id }, { currentTask: { id: task.id } });
            console.log(`         🔄 Machine ${machine.name} currentTask updated`);
          }

          task.method = { id: 1 } as Method;
          if (isTaskStartingToday) {
            task.assignedWorkers = (task.assignedWorkers || []).concat(workers);
            task.assignedMachines = (task.assignedMachines || []).concat(machine);
          }

          await queryRunner.manager.save(task);
          assignmentMade = true;
        }

        if (assignmentMade) {
          if (taskStart.toDateString() === new Date().toDateString()) {
            task.status = 'in-progress';
          } else {
            task.status = 'delayed';
          }

          await queryRunner.manager.save(task);
          console.log(`✅ Task ${task.id} scheduled (End: ${sharedTaskEnd.toDateString()})`);

          if (task.deadline) {
            const deadlineDate = new Date(task.deadline);
            const endDate = new Date(sharedTaskEnd);

            if (endDate > deadlineDate) {
              const diffMs = endDate.getTime() - deadlineDate.getTime();
              const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
              task.delayDays = diffDays;
              console.warn(`⚠️ Task ${task.id} kasni ${diffDays} dana.`);
            } else {
              task.delayDays = 0;
              console.log(`✅ Task ${task.id} završen na vreme ili ranije.`);
            }

            await queryRunner.manager.save(task);
          }

          groupAvailableDate = new Date(sharedTaskEnd);
          groupAvailableDate.setDate(groupAvailableDate.getDate() + 1);
        }
      }
    }

    await queryRunner.commitTransaction();
    console.log('✅ Finished scheduling tasks (transaction committed)');
  } catch (error) {
    console.error('❌ Error during scheduling, rolling back...', error);
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
    console.log('🔓 QueryRunner released');
  }
}





async adaptiveScheduleAllTasks(): Promise<void> {
  console.log('📅 Starting adaptive scheduling for all tasks...');

  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const tasks = await this.taskRepository.find({
      where: { status: In(['planned', 'delayed', 'in-progress']) },
      order: { priority: 'ASC' },
      relations: ['assignedWorkers', 'assignedMachines'],
    });
    console.log(`📋 Found ${tasks.length} tasks`);

    const tasksByType: Record<string, Task[]> = {};
    for (const task of tasks) {
      task.assignedWorkers = [];
      task.assignedMachines = [];
      //task.taskMaterials = [];

      const type = task.type?.toLowerCase() || 'other';
      if (!tasksByType[type]) tasksByType[type] = [];
      tasksByType[type].push(task);
    }

    for (const [keyword, taskGroup] of Object.entries(tasksByType)) {
      console.log(`\n🛠️ Scheduling tasks for group: "${keyword.toUpperCase()}"`);
      let groupAvailableDate = new Date();

      for (const task of taskGroup) {
        console.log(`\n🔎 Processing Task ${task.id}: ${task.name}`);
        await queryRunner.manager.delete(TaskAssignment, { task: { id: task.id } });

        const taskStart = new Date(groupAvailableDate);

        const availableWorkers = (await this.workerService.getAvailableWorkersForDay(taskStart, queryRunner.manager))
          .filter(w => w.type?.toLowerCase() === task.type?.toLowerCase());
        const availableMachines = (await this.machineService.getAvailableMachinesForDay(taskStart, queryRunner.manager))
          .filter(m => m.type?.toLowerCase() === task.type?.toLowerCase());

        if (availableWorkers.length < 1 || availableMachines.length < 1) {
          task.status = 'delayed';
          await queryRunner.manager.save(task);
          console.warn(`⚠️ Task ${task.id} delayed — insufficient resources.`);
          continue;
        }

        let maxTaskEnd = taskStart;

        let workersCopy = [...availableWorkers];
        const machinesWithWorkers: { machine: typeof availableMachines[0]; workers: typeof availableWorkers[0][] }[] = [];

   


        for (const machine of availableMachines) {
  const assignedWorkersForMachine = workersCopy.splice(0, Math.min(machine.maxWorkers, workersCopy.length));
  if (assignedWorkersForMachine.length === 0) break;
  machinesWithWorkers.push({ machine, workers: assignedWorkersForMachine });
  console.log(`🛠️ Machine ${machine.name} assigned workers: ${assignedWorkersForMachine.map(w => w.name).join(', ')}`);
}


if (machinesWithWorkers.length === 0) {
  task.status = 'delayed';
  await queryRunner.manager.save(task);
  console.warn(`⚠️ Task ${task.id} delayed — no workers distributed.`);
  continue;
}

const totalWorkersAll = machinesWithWorkers.flatMap(mw => mw.workers).length;
const totalMaxWorkersAll = machinesWithWorkers.reduce((sum, mw) => sum + mw.machine.maxWorkers, 0);
const totalSkillAll = machinesWithWorkers.flatMap(mw => mw.workers).reduce((sum, w) => sum + (w.skillLevel || 1), 0);
const avgSkillAll = totalSkillAll / totalWorkersAll;
const fullCapacitySkill = 2;
const totalTaskHours = (task.totalProducts - task.producedProducts) * task.hoursPerProduct;
const workerCountFactor = totalWorkersAll / totalMaxWorkersAll;
const skillFactor = avgSkillAll / fullCapacitySkill;
const efficiencyFactor = workerCountFactor * skillFactor || 0.0001;
const totalHours = totalTaskHours / efficiencyFactor;

console.log(`📊 Task ${task.id} calculation summary:`);
console.log(`   Total workers: ${totalWorkersAll}`);
console.log(`   Total max workers: ${totalMaxWorkersAll}`);
console.log(`   Total skill: ${totalSkillAll}`);
console.log(`   Avg skill: ${avgSkillAll.toFixed(2)}`);
console.log(`   Worker count factor: ${workerCountFactor.toFixed(2)}`);
console.log(`   Skill factor: ${skillFactor.toFixed(2)}`);
console.log(`   Efficiency factor: ${efficiencyFactor.toFixed(4)}`);
console.log(`   Total hours required: ${totalHours.toFixed(2)}`);

let totalDailyCapacity = machinesWithWorkers.reduce((sum, mw) => {
  const workerCapacity = Math.min(...mw.workers.map(w => w.capacityPerDay || 8));
  const machineCapacity = mw.machine.capacityPerDay || 8;
  const base = Math.min(workerCapacity, machineCapacity);
  const maxWorkerOver = Math.max(...mw.workers.map(w => w.maxOvertimeHours || 0));
  const maxMachineOver = mw.machine.maxOvertimeHours || 0;
  const extra = Math.min(maxWorkerOver, maxMachineOver, 4);
  const contribution = base + extra;

  console.log(`   🏭 Machine ${mw.machine.name}: base=${base}, extra=${extra}, dailyContribution=${contribution}`);
  return sum + contribution;
}, 0);

console.log(`   ⚡ Total daily capacity: ${totalDailyCapacity}`);


let hoursRemaining = totalHours;
let currentDay = new Date(taskStart);
const delay = task.delayDays;

while (hoursRemaining > 0) {
  const dayOfWeek = currentDay.getDay(); // 0 = nedelja, 6 = subota
  let dailyCapacity = 0;

  for (const { machine, workers } of machinesWithWorkers) {
    const workerCapacity = Math.min(...workers.map(w => w.capacityPerDay || 8));
    const machineCapacity = machine.capacityPerDay || 8;
    const base = Math.min(workerCapacity, machineCapacity);

    
    let extra = 0;
    if (delay > 0 && delay < 5 && dayOfWeek >= 1 && dayOfWeek <= 5) {
      
      extra = Math.min(Math.max(...workers.map(w => w.maxOvertimeHours || 0)), machine.maxOvertimeHours || 0, 4);
    } else if (delay >= 5 && delay < 20 && dayOfWeek >= 1 && dayOfWeek <= 5) {
     
      extra = Math.min(Math.max(...workers.map(w => w.maxOvertimeHours || 0)), machine.maxOvertimeHours || 0, 4);
    } else if (delay >= 20 && dayOfWeek >= 1 && dayOfWeek <= 5) {
    
      extra = Math.min(Math.max(...workers.map(w => w.maxOvertimeHours || 0)), machine.maxOvertimeHours || 0, 4);
    } else if (delay >= 5 && delay < 20 && dayOfWeek === 6) {
      
      extra = 0;
    } else if (delay >= 20 && dayOfWeek === 6) {
   
      extra = Math.min(Math.max(...workers.map(w => w.maxOvertimeHours || 0)), machine.maxOvertimeHours || 0, 4);
    }

    
    if (dayOfWeek === 0) dailyCapacity += 0;
    else dailyCapacity += base + extra;

    console.log(`   🏭 Machine ${machine.name}: base=${base}, extra=${extra}, cumulativeDailyCapacity=${dailyCapacity}`);
  }

  const actualWork = Math.min(hoursRemaining, dailyCapacity);
  hoursRemaining -= actualWork;

  console.log(`📅 ${currentDay.toDateString()} — totalDailyCapacity=${dailyCapacity}, actualWorked=${actualWork}, hoursRemaining=${hoursRemaining.toFixed(2)}`);

  if (hoursRemaining > 0) currentDay.setDate(currentDay.getDate() + 1);
}

const sharedTaskEnd = new Date(currentDay);
console.log(`✅ Task ${task.id} estimated end date: ${sharedTaskEnd.toDateString()}`);



for (const { machine, workers } of machinesWithWorkers) {
  const taskEnd = sharedTaskEnd;
  const isTaskStartingToday = taskStart.toDateString() === new Date().toDateString();

  for (const worker of workers) {
    await queryRunner.manager.save(TaskAssignment, { task, worker, startDate: taskStart, endDate: taskEnd });
    console.log(`      👷‍♂️ Worker ${worker.name} assignment saved for ${isTaskStartingToday ? "TODAY" : "FUTURE"}`);

    if (isTaskStartingToday) {
      await queryRunner.manager.update(Worker, { id: worker.id }, { currentTask: { id: task.id } });
      console.log(`         🔄 Worker ${worker.name} currentTask updated`);
    }
  }

  await queryRunner.manager.save(TaskAssignment, { task, machine, startDate: taskStart, endDate: taskEnd });
  console.log(`      🤖 Machine ${machine.name} assignment saved with shared END date`);

  if (isTaskStartingToday) {
    await queryRunner.manager.update(Machine, { id: machine.id }, { currentTask: { id: task.id } });
    console.log(`         🔄 Machine ${machine.name} currentTask updated`);
  }


  task.method = { id: delay > 0 ? (delay < 5 ? 2 : delay < 20 ? 3 : 4) : 1 } as Method;
  if (isTaskStartingToday) {
    task.assignedWorkers = (task.assignedWorkers || []).concat(workers);
    task.assignedMachines = (task.assignedMachines || []).concat(machine);
  }

  await queryRunner.manager.save(task);
}


task.delayDays = Math.max(
  0,
  Math.ceil(
    (sharedTaskEnd.getTime() -
      (task.deadline ? new Date(task.deadline).getTime() : taskStart.getTime())) /
      (1000 * 60 * 60 * 24)
  )
);
await queryRunner.manager.save(task);

groupAvailableDate = new Date(sharedTaskEnd);
groupAvailableDate.setDate(groupAvailableDate.getDate() + 1);

console.log(`✅ Task ${task.id} scheduled from ${taskStart.toDateString()} to ${sharedTaskEnd.toDateString()}`);

      }
    }

    await queryRunner.commitTransaction();
    console.log('✅ Adaptive scheduling finished successfully');
  } catch (error) {
    console.error('❌ Error during adaptive scheduling, rolling back...', error);
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
    console.log('🔓 QueryRunner released');
  }
}






async roughCutCapacityPlanning(startDate: Date, endDate: Date, overTime:boolean, weekend:boolean) {
  console.log(`📅 Starting RCCP analysis from ${startDate.toDateString()} to ${endDate.toDateString()}`);


  const assignments = await this.dataSource.getRepository(TaskAssignment).find({
    relations: ['task', 'worker', 'machine'],
    where: [
      { startDate: LessThanOrEqual(endDate), endDate: MoreThanOrEqual(startDate) }
    ]
  });


  const assignmentsByTask: Record<number, TaskAssignment[]> = {};
  for (const a of assignments) {
    if (!assignmentsByTask[a.task.id]) assignmentsByTask[a.task.id] = [];
    assignmentsByTask[a.task.id].push(a);
  }

  let totalRequiredWorkerHours = 0;
  let totalRequiredMachineHours = 0;
  let totalRequiredDays = 0;

  for (const [taskId, taskAssignments] of Object.entries(assignmentsByTask)) {
    const task = taskAssignments[0].task;
    const fullCapacityHours = task.hoursPerProduct * (task.totalProducts-task.producedProducts);


    const workers = taskAssignments.map(a => a.worker).filter(Boolean);
    const machines = taskAssignments.map(a => a.machine).filter(Boolean);

    console.log(`\n📋 Task ${task.id} - ${task.name}`);
    console.log(`👷‍♂️ Radnici (${workers.length}): ${workers.map(w => w.name).join(', ') || 'nema'}`);
    console.log(`🤖 Mašine (${machines.length}): ${machines.map(m => m.name).join(', ') || 'nema'}`);
    console.log(`📦 Ukupan obim posla: ${task.totalProducts} proizvoda × ${task.hoursPerProduct}h = ${fullCapacityHours}h`);


    const totalMachineMaxWorkers = machines.reduce((sum, m) => sum + (m.maxWorkers || 1), 0);
    const skillSum = workers.reduce((sum, w) => sum + (w.skillLevel || 1), 0);
    const avgSkill = workers.length > 0 ? skillSum / workers.length : 1;

    const fullCapacitySkill = 2;
    const workerCountFactor = workers.length / totalMachineMaxWorkers;
    const skillFactor = avgSkill / fullCapacitySkill;

    const efficiencyFactor = workerCountFactor * skillFactor || 0.0001;
    const effectiveTaskHours = fullCapacityHours / efficiencyFactor;

    console.log(`📊 Efikasnost izračunata:`);
    console.log(`- Machine maxWorkers ukupno: ${totalMachineMaxWorkers}`);
    console.log(`- Dodeljeni radnici: ${workers.length}`);
    console.log(`- Prosečan skill: ${avgSkill.toFixed(2)} / ${fullCapacitySkill}`);
    console.log(`- WorkerCount factor: ${(workerCountFactor * 100).toFixed(1)}%`);
    console.log(`- Skill factor: ${(skillFactor * 100).toFixed(1)}%`);
    console.log(`- ✅ Efikasnost: ${(efficiencyFactor * 100).toFixed(2)}%`);
    console.log(`- 🕒 Realno potrebno sati: ${effectiveTaskHours.toFixed(2)}h`);


    const machineCapacity = machines.reduce((sum, m) => sum + (m.capacityPerDay || 8), 0);
    const workerCapacity = workers.reduce((sum, w) => sum + (w.capacityPerDay || 8), 0);
    const daysNeeded = this.calculateWorkingDays(effectiveTaskHours, workerCapacity, machineCapacity);

    totalRequiredDays += daysNeeded;
    totalRequiredWorkerHours += effectiveTaskHours;
    totalRequiredMachineHours += effectiveTaskHours;

    console.log(`📆 Kapacitet radnika: ${workerCapacity}h/dan`);
    console.log(`⚙️ Kapacitet mašina: ${machineCapacity}h/dan`);
    console.log(`📅 Potrebno dana: ~${daysNeeded}\n`);
  }

  const daysInPeriod = await this.numberOfWorkingDays(startDate, endDate,weekend);

  const workers = await this.workerService.getAllWorkers();
  const machines = await this.machineService.getAllMachines();



let totalAvailableWorkerHours = 0;
let totalAvailableMachineHours = 0;


const availableWorkers = workers.filter(w => w.availability);
const availableMachines = machines.filter(m => m.availability);

if (overTime) {
  totalAvailableWorkerHours = availableWorkers.reduce((sum, w) => {
    const dailyCapacity = (w.capacityPerDay || 8) + (w.maxOvertimeHours || 0);
    return sum + dailyCapacity * daysInPeriod;
  }, 0);

  totalAvailableMachineHours = availableMachines.reduce((sum, m) => {
    const dailyCapacity = (m.capacityPerDay || 8) + (m.maxOvertimeHours || 0);
    return sum + dailyCapacity * daysInPeriod;
  }, 0);
} else {
  totalAvailableWorkerHours = availableWorkers.reduce((sum, w) => {
    const dailyCapacity = (w.capacityPerDay || 8);
    return sum + dailyCapacity * daysInPeriod;
  }, 0);

  totalAvailableMachineHours = availableMachines.reduce((sum, m) => {
    const dailyCapacity = (m.capacityPerDay || 8);
    return sum + dailyCapacity * daysInPeriod;
  }, 0);
}



const budget = await this.budgetService.returnBudget();
//const taskTotalPrice = assignments.reduce((sum, a) => sum + (a.task.totalCost || 0), 0);
const uniqueTasks = new Set<number>();
let taskTotalPrice = 0;

for (const a of assignments) {
  if (!uniqueTasks.has(a.task.id)) {
    uniqueTasks.add(a.task.id);
    taskTotalPrice += a.task.totalCost || 0;
  }
}


console.log('💰 Budget check ------------------------------------');
console.log(`📝 Budget: ${budget.toFixed(2)}€`);
console.log(`📝 Ukupna suma totalPrice zadataka u periodu: ${taskTotalPrice.toFixed(2)}€`);

if (taskTotalPrice > budget) {
  console.warn(`⚠️ Ukupna suma zadataka (${taskTotalPrice.toFixed(2)}€) PRELAZI budžet (${budget.toFixed(2)}€)!`);
} else {
  console.log(`✅ Ukupna suma zadataka (${taskTotalPrice.toFixed(2)}€) je unutar budžeta (${budget.toFixed(2)}€).`);
}
console.log('----------------------------------------------------');



  console.log('📊 RCCP Summary --------------------------------------');
  console.log(`🧰 Total required worker hours: ${totalRequiredWorkerHours.toFixed(2)}h`);
  console.log(`🧰 Total available worker hours: ${totalAvailableWorkerHours.toFixed(2)}h`);
  console.log(`⚙️ Total required machine hours: ${totalRequiredMachineHours.toFixed(2)}h`);
  console.log(`⚙️ Total available machine hours: ${totalAvailableMachineHours.toFixed(2)}h`);
  console.log(`📆 Total working days needed: ~${totalRequiredDays}`);
  console.log(`📆 Working days available: ${daysInPeriod}`);
  console.log('----------------------------------------------------');

  return {
    totalRequiredWorkerHours,
    totalAvailableWorkerHours,
    totalRequiredMachineHours,
    totalAvailableMachineHours,
    totalRequiredDays,
    daysInPeriod,
    workerCapacityOk: totalRequiredWorkerHours <= totalAvailableWorkerHours,
    machineCapacityOk: totalRequiredMachineHours <= totalAvailableMachineHours,
    budgetOk:taskTotalPrice<=budget,
  };
}



 
private calculateWorkingDays(totalHours: number, workerCapacity: number, machineCapacity: number): number {
  const dailyThroughput = Math.min(workerCapacity, machineCapacity);
  let remainingHours = totalHours;
  let days = 0;

  while (remainingHours > 0) {
    days++;
    remainingHours -= dailyThroughput;
  }

  return days;
}


private async numberOfWorkingDays(start: Date, end: Date, weekend: boolean): Promise<number> {
  let current = new Date(start);
  let workingDays = 0;

  while (current <= end) {
    const day = current.getDay(); 

    if (weekend) {

      if (day !== 0) {
        workingDays++;
      }
    } else {

      if (day !== 0 && day !== 6) {
        workingDays++;
      }
    }

    current.setDate(current.getDate() + 1);
  }

  return workingDays;
}





async generateProductionReport(startDate: Date, endDate: Date) {

  const tasks = await this.taskRepository.find({
    relations: ['assignedWorkers', 'assignedMachines', 'method', 'assignments'],
    order: { priority: 'ASC' },
  });


  const tasksInPeriod = tasks.filter(task => {
    if (!task.assignments || task.assignments.length === 0) return true;
    return task.assignments.some(a =>
      a.startDate <= endDate && a.endDate >= startDate
    );
  });


  const taskReports = tasksInPeriod.map(task => {
 
    const taskStart = task.assignments?.length
      ? new Date(Math.min(...task.assignments.map(a => a.startDate.getTime())))
      : null;

    const taskEnd = task.assignments?.length
      ? new Date(Math.max(...task.assignments.map(a => a.endDate.getTime())))
      : null;


    const delay = task.delayDays || 0;
    const delayedStatus = delay > 0 ? 'YES' : 'NO';

    return {
      id: task.id,
      name: task.name,
      priority: task.priority,
      status: task.status,
      produced:task.producedProducts,
      totalProducts: task.totalProducts,
      hoursPerProduct: task.hoursPerProduct,
      plannedStart: taskStart,
      plannedEnd: taskEnd,
      delayDays: delay,
      delayed: delayedStatus,
      materials:task.taskMaterials?.map(w => ({
        id: w.id,
        used: w.quantityUsed,
        name: w.material.name,
        price:w.material.price,
      })) || [],
      workers: task.assignedWorkers?.map(w => ({
        id: w.id,
        name: w.name,
        capacityPerDay: w.capacityPerDay,
      })) || [],
      machines: task.assignedMachines?.map(m => ({
        id: m.id,
        name: m.name,
        capacityPerDay: m.capacityPerDay,
      })) || [],
      method: task.method?.name || null,
    };
  });

  const total = taskReports.length;
  const planned = taskReports.filter(t => t.status === 'planned').length;
  const inProgress = taskReports.filter(t => t.status === 'in-progress').length;
  const completed = taskReports.filter(t => t.status === 'completed').length;
  const delayed = taskReports.filter(t => t.delayDays > 0).length;


  const report = {
    period: { startDate, endDate },
    summary: {
      totalTasks: total,
      planned,
      inProgress,
      completed,
      delayed,
      onTime: total - delayed,
      delayedPercentage: total > 0 ? ((delayed / total) * 100).toFixed(2) + '%' : '0%',
    },
    tasks: taskReports,
  };

  return report;
}





async setBudget() {
  const today = dayjs().startOf('day').toDate();
  const tomorrow = dayjs().add(1, 'day').startOf('day').toDate();
  console.log('📅 Today start:', today);
  console.log('📅 Tomorrow start:', tomorrow);

 
  const completedAssignments = await this.taskAssignmentRepository.find({
    relations: ['task', 'task.taskMaterials', 'task.taskMaterials.material'],
    where: {
      endDate: Between(today, tomorrow),
    },
  });
  console.log(`✅ Found ${completedAssignments.length} completed assignments today.`);

  let totalRevenueAdded = 0;


  let totalMaterialCostCompleted = 0;
const processedTasks = new Set<number>(); 

for (const assignment of completedAssignments) {
  const task = assignment.task;
  console.log(`🔎 Checking completed task ${task.id} - ${task.name}, current status: ${task.status}`);

  if (task.status !== 'completed') {
    task.status = 'completed';
    await this.taskRepository.save(task);
    //totalRevenueAdded += task.revenue;
    console.log(`💰 Task ${task.id} marked as completed, revenue added: ${task.revenue}`);
  }


  if (!processedTasks.has(task.id)) {
    processedTasks.add(task.id);
    totalRevenueAdded += task.revenue;

    if (task.taskMaterials && task.taskMaterials.length > 0) {
      for (const tm of task.taskMaterials) {
        const mat = tm.material;
        const quantityUsed = tm.quantityUsed || 0;
        const unitPrice = mat.price || 0;
        const materialCost = quantityUsed * unitPrice;
        totalMaterialCostCompleted += materialCost;
        console.log(`📦 MaterijalTotalCostr ${totalMaterialCostCompleted}`);

        console.log(`📦 Materijal ${mat.name}: ${quantityUsed} × ${unitPrice}€ = ${materialCost}€`);
      }
    }
  } else {
    console.log(`ℹ️ Materijal za task #${task.id} je već uračunat, preskačem...`);
  }
}


 
  let budget = await this.budgetRepository.findOne({ where: { id: 1 } });
  if (!budget) {
    budget = this.budgetRepository.create({
      amountAllocated: 0,
      amountUsed: 0,
      currency: 'EUR',
    });
    console.log('⚠️ No existing budget found, created new budget entry.');
  }
  console.log('💵 Budget before revenue addition:', budget.amountAllocated);
  budget.amountAllocated += totalRevenueAdded;
  console.log(`💵 Added revenue: ${totalRevenueAdded}, new allocated amount: ${budget.amountAllocated}`);

  
  
  const activeAssignments = await this.taskAssignmentRepository
  .createQueryBuilder('assignment')
  .leftJoinAndSelect('assignment.task', 'task')
  .leftJoinAndSelect('task.assignedWorkers', 'workers')
  .leftJoinAndSelect('task.method', 'method')
  .where('task.status = :inProgress', { inProgress: 'in-progress' })
  .orWhere('task.status = :completed AND assignment.endDate BETWEEN :today AND :tomorrow', {
    completed: 'completed',
    today,
    tomorrow,
  })
  .getMany();

console.log(`Found ${activeAssignments.length} active assignments`);

  let totalCost = 0;
  let totalWorkers = 0;
  let totalHours = 0;

  const countedWorkers = new Set<number>();

for (const assignment of activeAssignments) {
  const task = assignment.task;
  const workers = task.assignedWorkers || [];

  for (const worker of workers) {
    if (countedWorkers.has(worker.id)) continue; 
    countedWorkers.add(worker.id);

    totalWorkers++;
    const baseHours = worker.capacityPerDay;
    let overtimeHours = 0;
     let overtimeRate = 0;
     let weekendHours = 0;
     let weekendRate = 0;
    let hourlyRate = worker.hourlyRate;

    if (task.method?.id === 2){
       overtimeHours = worker.maxOvertimeHours || 0;
       if (worker.weekendHourlyRate) 
        overtimeRate=worker.overTimeHourlyRate;

    }
    if (task.method?.id === 3) {
      weekendHours=baseHours;
      overtimeHours = worker.maxOvertimeHours || 0;
      if (worker.weekendHourlyRate) 
       {
       weekendRate=worker.weekendHourlyRate;
      overtimeRate=worker.overTimeHourlyRate;

       }
    }
    if (task.method?.id === 4) {
      weekendHours=baseHours+worker.maxOvertimeHours;
      overtimeHours = worker.maxOvertimeHours|| 0;
      if (worker.weekendHourlyRate) {
      weekendRate=worker.weekendHourlyRate;
      overtimeRate=worker.overTimeHourlyRate;
      }
    }

    /// LOGIKA IZMENI
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Nedelja, 6 = Subota


        if (dayOfWeek === 0) {
           console.log("🚫 Nedelja – funkcija se ne izvršava");
             return;
           }
           else 
            if (dayOfWeek === 6) { 

      
            console.log("🚫 Dan je Subota – koristi se vikend logika");

            console.log(`   👷 Worker ${worker.id} - Base hours: ${baseHours}`);
            console.log(`   ⏱️ Overtime hours: ${overtimeHours} at rate ${overtimeRate}`);
            console.log(`   🎉 Weekend hours: ${weekendHours} at rate ${weekendRate}`);
            console.log(`   💰 Hourly rate: ${hourlyRate}`);

            const totalWorkedHours = baseHours + overtimeHours + weekendHours;
            const costForWorker = baseHours * hourlyRate
                                + overtimeHours * overtimeRate
                                + weekendHours * weekendRate;

            totalHours += totalWorkedHours;
            totalCost += costForWorker;

            console.log(`✅ Worker ${worker.id} TOTAL hours: ${totalWorkedHours}`);
            console.log(`✅ Worker ${worker.id} TOTAL cost: ${costForWorker}`);
          } else { 
            console.log("🟢 Dan je radni dan – koristi se normalna logika");

            console.log(`   👷 Worker ${worker.id} - Base hours: ${baseHours}`);
            console.log(`   ⏱️ Overtime hours: ${overtimeHours} at rate ${overtimeRate}`);
            console.log(`   💰 Hourly rate: ${hourlyRate}`);

            const totalWorkedHours = baseHours + overtimeHours;
            const costForWorker = baseHours * hourlyRate + overtimeHours * overtimeRate;

            totalHours += totalWorkedHours;
            totalCost += costForWorker;

            console.log(`✅ Worker ${worker.id} TOTAL hours: ${totalWorkedHours}`);
            console.log(`✅ Worker ${worker.id} TOTAL cost: ${costForWorker}`);
          }

          console.log(`🔹 Cumulative total hours so far: ${totalHours}`);
          console.log(`🔹 Cumulative total cost so far: ${totalCost}`);

    

   
  }
}



  console.log('💰 Budget before cost deduction:', budget.amountAllocated);
  console.log(`💸 Total cost for workers today: ${totalCost}`);
  console.log(`👷 Total workers today: ${totalWorkers}, total hours: ${totalHours}`);
  budget.amountUsed += totalCost+totalMaterialCostCompleted;
  budget.amountAllocated -= totalCost+totalMaterialCostCompleted;
  console.log('💰 Budget after cost deduction:', budget.amountAllocated);

  await this.budgetRepository.save(budget);


  console.log('📅 DNEVNI BUDŽETNI IZVEŠTAJ ----------------------------');
  console.log(`📈 Dodato prihoda: ${totalRevenueAdded.toFixed(2)} EUR`);
  console.log(`👷‍♂️ Ukupno radnika radilo: ${totalWorkers}`);
  console.log(`⏱️ Ukupno sati rada: ${totalHours}`);
  console.log(`💸 Ukupan trošak radnika: ${totalCost.toFixed(2)} EUR`);
  console.log(`💰 Novi budžet: ${budget.amountAllocated.toFixed(2)} EUR`);
  console.log('------------------------------------------------------');

  return {
    addedRevenue: totalRevenueAdded,
    totalCost,
    totalWorkers,
    totalHours,
    finalBudget: budget.amountAllocated,
  };
}

@Cron('0 17 * * *') // svaki dan u 17:00
async handleDailyBudgetUpdate() {
  await this.setBudget();
}


async updateDailyProducedProducts() {

const now = new Date();


const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());


const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  console.log('📅 Izračun proizvodnje za danas:', today);


  const activeAssignments = await this.taskAssignmentRepository.find({
    relations: ['task', 'task.assignedWorkers', 'task.assignedMachines'],
    where: {
      startDate:  LessThanOrEqual(tomorrow),
    endDate: MoreThanOrEqual(today),
    task: {
      status: 'in-progress',  
    },
    },
  });

  console.log(`🛠️ Aktivnih assignment-a danas: ${activeAssignments.length}`);

  for (const assignment of activeAssignments) {
    const task = assignment.task;
    const workers = task.assignedWorkers || [];
    const machines = task.assignedMachines || [];

    
    const totalMachineMaxWorkers = machines.reduce((sum, m) => sum + (m.maxWorkers || 1), 0);
    const skillSum = workers.reduce((sum, w) => sum + (w.skillLevel || 1), 0);
    const avgSkill = workers.length > 0 ? skillSum / workers.length : 1;

    const fullCapacitySkill = 2; 
    const workerCountFactor = workers.length / totalMachineMaxWorkers;
    const skillFactor = avgSkill / fullCapacitySkill;

    const efficiencyFactor = workerCountFactor * skillFactor || 0.0001;

    const totalHours =machines.reduce((sum, w) => sum + (w.capacityPerDay || 8), 0);
    const effectiveTaskHours = totalHours * efficiencyFactor;

   


    const producedToday = effectiveTaskHours / (task.hoursPerProduct || 1);


    console.log(`📦 Zad. #${task.id} - Proizvedeno danas: ${producedToday.toFixed(2)} kom`);


    task.producedProducts = (task.producedProducts || 0) + producedToday;
    await this.taskRepository.save(task);

    console.log(`✅ Novi ukupni producedProducts: ${task.producedProducts.toFixed(2)} kom`);
  }

  console.log('📊 Dnevna proizvodnja ažurirana ✅');
}


@Cron('0 17 * * *')
async handleDailyProductionUpdate() {
  await this.updateDailyProducedProducts();
}






async calculateTotalCostForAllTasks(): Promise<void> {
  console.log('📊 Početak kalkulacije ukupnih troškova za SVE zadatke...');

  const tasks = await this.taskRepository.find({
    relations: [
      'assignments',
      'assignments.worker',
      'assignedWorkers',
      'method'
    ]
  });

  if (!tasks.length) {
    console.warn('⚠️ Nema zadataka u bazi.');
    return;
  }

  console.log(`✅ Pronađeno ${tasks.length} zadataka za kalkulaciju.\n`);

  for (const task of tasks) {
    console.log(`===========================================`);
    console.log(`🔍 Početak kalkulacije troška za zadatak #${task.id} - ${task.name}`);
    console.log(`📅 Assignment-a: ${task.assignments.length}`);

    let totalWorkerCost = 0;
    let totalMaterialCost = 0;
    let totalHours = 0;

    for (const assignment of task.assignments) {
      console.log(`\n📌 Obrada assignment-a #${assignment.id}`);

      const start = new Date(assignment.startDate);
      const end = new Date(assignment.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;
      console.log(`   🗓️ Trajanje: ${start.toDateString()} ➝ ${end.toDateString()} (${days} dana)`);

      //  radnik
      const worker = assignment.worker;
      if (worker) {
        let baseHours = 0;
        let weekendHours = 0;
        let overtimeHours = 0;
        const hourlyRate = worker.hourlyRate;
        let overtimeRate = worker.overTimeHourlyRate || 0;
        let weekendRate = worker.weekendHourlyRate || 0;


for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
  const dayOfWeek = d.getDay();

  if (dayOfWeek === 0) {
    console.log(`   🛑 ${d.toDateString()} je nedelja ➝ ne radi se`);
    continue;
  }

  if (dayOfWeek === 6) {

    if (task.method?.id === 4) {

      const totalSaturdayHours = worker.capacityPerDay + (worker.maxOvertimeHours || 0);
      weekendHours += totalSaturdayHours;
      console.log(`   🎉 ${d.toDateString()} je subota ➝ +${totalSaturdayHours}h weekend (uključujući prekovremene)`);
    } else if (task.method?.id === 3){

      weekendHours += worker.capacityPerDay;
      console.log(`   🎉 ${d.toDateString()} je subota ➝ +${worker.capacityPerDay}h weekend`);
    }
  } else {
    // Radni dan
    baseHours += worker.capacityPerDay;
    console.log(`   📅 ${d.toDateString()} je radni dan ➝ +${worker.capacityPerDay}h base`);
  }
}


if (task.method?.id === 2 || task.method?.id === 3) {
 
  const workingDays = Math.floor(baseHours / worker.capacityPerDay);
  overtimeHours = workingDays * (worker.maxOvertimeHours || 0);
}

if (task.method?.id === 4) {

  const workingDays = Math.floor(baseHours / worker.capacityPerDay);
  overtimeHours = workingDays * (worker.maxOvertimeHours || 0);
 
}



        const costForWorker =
          baseHours * hourlyRate +
          overtimeHours * overtimeRate +
          weekendHours * weekendRate;

        totalWorkerCost += costForWorker;
        totalHours += baseHours + overtimeHours + weekendHours;

        console.log(`   👷 Worker ${worker.id}:`);
        console.log(`      ⏱️ Base: ${baseHours}h × ${hourlyRate}€ = ${(baseHours * hourlyRate).toFixed(2)}€`);
        console.log(`      ⏱️ Overtime: ${overtimeHours}h × ${overtimeRate}€ = ${(overtimeHours * overtimeRate).toFixed(2)}€`);
        console.log(`      🎉 Weekend: ${weekendHours}h × ${weekendRate}€ = ${(weekendHours * weekendRate).toFixed(2)}€`);
        console.log(`      💰 Trošak radnika: ${costForWorker.toFixed(2)}€`);
      } else {
        console.log(`   ❗ Nema radnika za ovaj assignment.`);
      }



    }
                    
if (task.taskMaterials && task.taskMaterials.length > 0) {
  for (const tm of task.taskMaterials) {
    const mat = tm.material; 

    const quantityUsed = tm.quantityUsed || 0; 
    const unitPrice = mat.price || 0; 
    const materialCost = quantityUsed * unitPrice;
    totalMaterialCost += materialCost;

    console.log(`   📦 Materijal: ${mat.name}`);
    console.log(`      ⚖️ Količina: ${quantityUsed} ${mat.unit}`);
    console.log(`      💲 Cena po jedinici: ${unitPrice}€`);
    console.log(`      💰 Trošak materijala: ${materialCost.toFixed(2)}€`);
  }
}else {
  console.log(`   📦 Nema materijala za ovaj task.`);
}

    const totalCost = totalWorkerCost + totalMaterialCost;
    task.totalCost = totalCost;
    task.revenue=task.totalProducts*task.pricePerProduct;

    console.log('\n📊 REZIME ZA ZADATAK ----------------------------');
    console.log(`👷‍♂️ Trošak radnika: ${totalWorkerCost.toFixed(2)}€`);
    console.log(`📦 Trošak materijala: ${totalMaterialCost.toFixed(2)}€`);
    console.log(`💸 UKUPAN TROŠAK ZADATKA: ${totalCost.toFixed(2)}€`);
    console.log(`⏱️ Ukupan broj sati: ${totalHours}`);
    console.log('------------------------------------------------');

   
    await this.taskRepository.save(task);
    console.log(`✅ Total price za zadatak #${task.id} ažuriran na ${totalCost.toFixed(2)}€\n`);
  }

  console.log('✅ Kalkulacija troškova za SVE zadatke završena.');
}




 async getStats() {

    const totalBudget = await this.budgetService.returnBudget();
   

    const totalTasks = await this.taskRepository.count();

    const rccpAlerts = await this.taskRepository.count({
      where: [
       // { status: 'delayed' },
        { status: 'blocked-by-budget' },
        { status: 'blocked-by-delayed' },
      ],
    });

 
    const totalWorkers = await this.workerRepository.count();
    const totalMachines = await this.machineRepository.count();

    return {
      totalBudget,
      totalTasks,
      rccpAlerts,
      totalWorkers,
      totalMachines,
    };
  }







}