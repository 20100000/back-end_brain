import { Injectable, BadRequestException, NotFoundException, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Farm } from './entities/farm.entity';
import { FarmCrop } from 'src/modules/farm-crops/entities/farm-crop.entity';
import { RuralProducer } from '../rural-producers/entities/rural-producer.entity';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { Sequelize } from 'sequelize';

@Injectable()
export class FarmService {
  private readonly logger = new Logger(FarmService.name);

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

    try {
      const producerExists = await this.ruralProducerModel.findByPk(producer_id);
      if (!producerExists) {
        throw new NotFoundException(`Não é possível cadastrar a fazenda. O produtor de ID ${producer_id} não existe.`);
      }

      this.validateFarmAreas(total_farm_area, arable_area, vegetation_area);

      const farm = await this.farmModel.create(createFarmDto as any);

      if (initial_crops && initial_crops.length > 0) {
        const cropsData = initial_crops.map((item: any) => ({
          farm_id: farm.id,
          crop_name: item.crop_name.toUpperCase(),
          harvest: Number(item.harvest),
        }));

        await this.farmCropModel.bulkCreate(cropsData);
      }

      return await this.findOne(farm.id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;

      this.logger.error(`Erro crítico ao criar propriedade rural. Payload: ${JSON.stringify(createFarmDto)}`, error.stack);
      throw new InternalServerErrorException('Erro interno ao processar a criação da propriedade.');
    }
  }

  async update(id: number, updateFarmDto: UpdateFarmDto): Promise<Farm> {
    try {
      const farm = await this.findOne(id);
      const { crops, ...farmData } = updateFarmDto;

      if (farmData.producer_id !== undefined) {
        const newProducerExists = await this.ruralProducerModel.findByPk(farmData.producer_id);
        if (!newProducerExists) {
          throw new NotFoundException(`O produtor de ID ${farmData.producer_id} não existe.`);
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
            if (existingCrop) {
              await existingCrop.update({
                crop_name: cropItem.crop_name ? cropItem.crop_name.toUpperCase() : existingCrop.crop_name,
                harvest: cropItem.harvest !== undefined ? Number(cropItem.harvest) : existingCrop.harvest
              });
            }
          } else {
            if (cropItem.crop_name) {
              await this.farmCropModel.create({
                farm_id: farm.id,
                crop_name: cropItem.crop_name.toUpperCase(),
                harvest: Number(cropItem.harvest || new Date().getFullYear())
              } as any);
            }
          }
        }
      }
      return await this.findOne(farm.id);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;

      this.logger.error(`Erro crítico ao atualizar a propriedade ID ${id}. Dados: ${JSON.stringify(updateFarmDto)}`, error.stack);
      throw new InternalServerErrorException('Erro interno ao atualizar a propriedade.');
    }
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
    try {
      return await this.farmModel.findAll({
        include: [FarmCrop],
        order: [['id', 'ASC']],
      });
    } catch (error) {
      this.logger.error('Erro ao listar todas as propriedades rurais.', error.stack);
      throw new InternalServerErrorException('Erro interno ao buscar dados.');
    }
  }

  async findOne(id: number): Promise<Farm> {
    try {
      const farm = await this.farmModel.findByPk(id, {
        include: [FarmCrop],
      });

      if (!farm) {
        throw new NotFoundException(`Propriedade rural com o ID ${id} não encontrada.`);
      }

      return farm;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(`Erro ao buscar a propriedade rural de ID ${id}.`, error.stack);
      throw new InternalServerErrorException('Erro interno ao buscar a propriedade.');
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      const farm = await this.findOne(id);
      await farm.destroy();
      return { message: `Propriedade rural de ID ${id} excluída com sucesso.` };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(`Erro ao remover a propriedade rural de ID ${id}.`, error.stack);
      throw new InternalServerErrorException('Erro interno ao remover a propriedade.');
    }
  }

  async countAll(): Promise<{ total_farms: number }> {
    try {
      const total = await this.farmModel.count();
      return { total_farms: total };
    } catch (error) {
      this.logger.error('Erro ao contabilizar total de fazendas.', error.stack);
      throw new InternalServerErrorException('Erro ao gerar indicador de contagem.');
    }
  }

  async sumTotalHectares(): Promise<{ total_hectares: number }> {
    try {
      const total = await this.farmModel.sum('total_farm_area');
      return { total_hectares: Number(total) || 0 };
    } catch (error) {
      this.logger.error('Erro ao somar total de hectares mapeados.', error.stack);
      throw new InternalServerErrorException('Erro ao gerar indicador de hectares.');
    }
  }

  async getGroupByState(): Promise<{ state: string; count: number }[]> {
    try {
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
    } catch (error) {
      this.logger.error('Erro ao agrupar fazendas por estado (Gráficos).', error.stack);
      throw new InternalServerErrorException('Erro ao coletar dados demográficos.');
    }
  }

  async getGroupByCrop(): Promise<{ crop_name: string; count: number }[]> {
    try {
      const result = await this.farmCropModel.findAll({
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
    } catch (error) {
      this.logger.error('Erro ao agrupar propriedades por tipo de cultura.', error.stack);
      throw new InternalServerErrorException('Erro ao coletar dados de cultivo.');
    }
  }

  async getGroupByArable(): Promise<{ arable_area_total: number; vegetation_area_total: number }> {
    try {
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
    } catch (error) {
      this.logger.error('Erro ao consolidar soma de solo arável vs vegetação.', error.stack);
      throw new InternalServerErrorException('Erro ao coletar dados de solo.');
    }
  }
}
