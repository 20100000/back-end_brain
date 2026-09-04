import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RuralProducersService } from './rural-producers.service';
import { RuralProducersController } from './rural-producers.controller';
import { RuralProducer } from './entities/rural-producer.entity';

@Module({
  imports: [SequelizeModule.forFeature([RuralProducer])],
  controllers: [RuralProducersController],
  providers: [RuralProducersService],
})
export class RuralProducersModule {}
