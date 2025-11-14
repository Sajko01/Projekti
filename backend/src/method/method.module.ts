import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MethodService } from './method.service';
import { MethodController } from './method.controller';
import { Method } from './method.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Method])],
  providers: [MethodService],
  controllers: [MethodController],
})
export class MethodModule {}
