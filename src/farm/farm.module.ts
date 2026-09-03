import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { FarmService } from './farm.service';
import { FarmController } from './farm.controller';
import { Farm } from './entities/farm.entity';
import { RuralProducer } from 'src/rural-producers/entities/rural-producer.entity';
import { FarmCrop } from 'src/farm-crops/entities/farm-crop.entity';

@Module({
  imports: [SequelizeModule.forFeature([Farm, RuralProducer, FarmCrop])],
  controllers: [FarmController],
  providers: [FarmService],
})
export class FarmModule {}
