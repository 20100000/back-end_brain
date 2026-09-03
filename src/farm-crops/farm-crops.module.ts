import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { FarmCropsService } from './farm-crops.service';
import { FarmCropsController } from './farm-crops.controller';
import { FarmCrop } from './entities/farm-crop.entity';
import { Farm } from 'src/farm/entities/farm.entity';

@Module({
  imports: [SequelizeModule.forFeature([FarmCrop, Farm])],
  controllers: [FarmCropsController],
  providers: [FarmCropsService],
})
export class FarmCropsModule {}
