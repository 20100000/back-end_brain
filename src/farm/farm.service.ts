import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Farm } from './entities/farm.entity';
import { FarmCrop } from 'src/farm-crops/entities/farm-crop.entity';
import { RuralProducer } from '../rural-producers/entities/rural-producer.entity';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { Sequelize } from 'sequelize';

@Injectable()
export class FarmService {
  constructor(
    @InjectModel(Farm)
    private farmModel: typeof Farm,

    @InjectModel(RuralProducer)
    private ruralProducerModel: typeof RuralProducer,

    @InjectModel(FarmCrop)
    private farmCropModel: typeof FarmCrop,
  ) {}

  async create(createFarmDto: CreateFarmDto): Promise<Farm> {
    const { producer_id, total_farm_area, arable_area, vegetation_area, initial_crops } = createFarmDto;

    const producerExists = await this.ruralProducerModel.findByPk(producer_id);
    if (!producerExists) {
      throw new NotFoundException(`Não é possível cadastrar a fazenda. O produtor de ID ${producer_id} não existe.`);
    }

    this.validateFarmAreas(total_farm_area, arable_area, vegetation_area);

    const farm = await this.farmModel.create(createFarmDto as any);

    if (initial_crops && initial_crops.length > 0) {
      const cropsData = initial_crops.map((cropName) => ({
        farm_id: farm.id,
        crop_name: cropName.toUpperCase(),
      }));
      
      await this.farmCropModel.bulkCreate(cropsData);
    }

    return this.findOne(farm.id);
  }

  async update(id: number, updateFarmDto: UpdateFarmDto): Promise<Farm> {
    const farm = await this.findOne(id);

    const { crops, ...farmData } = updateFarmDto;

    if (farmData.producer_id !== undefined) {
      const newProducerExists = await this.ruralProducerModel.findByPk(farmData.producer_id);
      if (!newProducerExists) {
        throw new NotFoundException(`Não é possível transferir a fazenda. O novo produtor de ID ${farmData.producer_id} não existe.`);
      }
    }

    const totalArea = farmData.total_farm_area !== undefined ? farmData.total_farm_area : farm.total_farm_area;
    const arableArea = farmData.arable_area !== undefined ? farmData.arable_area : farm.arable_area;
    const vegetationArea = farmData.vegetation_area !== undefined ? farmData.vegetation_area : farm.vegetation_area;

    this.validateFarmAreas(totalArea, arableArea, vegetationArea);

    await farm.update(farmData);

    if (crops && crops.length > 0) {
      for (const cropItem of crops) {
        if (cropItem.id) {
          const existingCrop = await this.farmCropModel.findOne({
            where: { id: cropItem.id, farm_id: farm.id }
          });
          
          if (existingCrop && cropItem.crop_name) {
            await existingCrop.update({ crop_name: cropItem.crop_name.toUpperCase() });
          }
        } else {
          if (cropItem.crop_name) {
            await this.farmCropModel.create({
              farm_id: farm.id,
              crop_name: cropItem.crop_name.toUpperCase()
            } as any);
          }
        }
      }
    }
    return this.findOne(farm.id);
  }

  private validateFarmAreas(totalArea: number, arableArea: number, vegetationArea: number): void {
    const total = Number(totalArea);
    const arable = Number(arableArea);
    const vegetation = Number(vegetationArea);

    if (arable + vegetation > total) {
      throw new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: `A soma da área agricultável (${arable} ha) e da área de vegetação (${vegetation} ha) totaliza ${arable + vegetation} ha, o que ultrapassa a área total da fazenda (${total} ha).`,
      });
    }
  }

  async findAll(): Promise<Farm[]> {
    return await this.farmModel.findAll({
      include: [FarmCrop],
      order: [['id', 'ASC']],
    });
  }

  async findOne(id: number): Promise<Farm> {
    const farm = await this.farmModel.findByPk(id, {
      include: [FarmCrop],
    });

    if (!farm) {
      throw new NotFoundException(`Propriedade rural com o ID ${id} não encontrada.`);
    }

    return farm;
  }

  async remove(id: number): Promise<{ message: string }> {
    const farm = await this.findOne(id);
    await farm.destroy();
    return { message: `Propriedade rural de ID ${id} excluída com sucesso.` };
  }

  async countAll(): Promise<{ total_farms: number }> {
    const total = await this.farmModel.count();
    return { total_farms: total };
  }

  async sumTotalHectares(): Promise<{ total_hectares: number }> {
    const total = await this.farmModel.sum('total_farm_area');    
    return { total_hectares: Number(total) || 0 };
  }

  async getGroupByState(): Promise<{ state: string; count: number }[]> {
    const result = await this.farmModel.findAll({
      attributes: [
        'state',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
      ],
      group: ['state'],
      raw: true,
    });

    return result.map((item: any) => ({
      state: item.state,
      count: Number(item.count),
    }));
  }

  async getGroupByCrop(): Promise<{ crop_name: string; count: number }[]> {
    const result = await FarmCrop.findAll({
      attributes: [
        'crop_name',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
      ],
      group: ['crop_name'],
      raw: true,
    });

    return result.map((item: any) => ({
      crop_name: item.crop_name,
      count: Number(item.count),
    }));
  }

  async getGroupByArable(): Promise<{ arable_area_total: number; vegetation_area_total: number }> {
    const result: any = await this.farmModel.findOne({
      attributes: [
        [Sequelize.fn('SUM', Sequelize.col('arable_area')), 'arable_total'],
        [Sequelize.fn('SUM', Sequelize.col('vegetation_area')), 'vegetation_total'],
      ],
      raw: true,
    });

    return {
      arable_area_total: Number(result?.arable_total) || 0,
      vegetation_area_total: Number(result?.vegetation_total) || 0,
    };
  }
}
