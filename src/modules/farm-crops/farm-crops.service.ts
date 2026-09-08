import { Injectable, NotFoundException, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FarmCrop } from './entities/farm-crop.entity';
import { Farm } from 'src/modules/farm/entities/farm.entity';
import { CreateFarmCropDto } from './dto/create-farm-crop.dto';
import { UpdateFarmCropDto } from './dto/update-farm-crop.dto';

@Injectable()
export class FarmCropsService {
  private readonly logger = new Logger(FarmCropsService.name);

  constructor(
    @InjectModel(FarmCrop)
    private farmCropModel: typeof FarmCrop,

    @InjectModel(Farm)
    private farmModel: typeof Farm,
  ) {}

  async create(createFarmCropDto: CreateFarmCropDto): Promise<FarmCrop> {
    const { farm_id } = createFarmCropDto;
    try {
      const farmExists = await this.farmModel.findByPk(farm_id);
      if (!farmExists) {
        this.logger.warn(`Falha ao criar cultura: A fazenda ID ${farm_id} não foi encontrada no sistema.`);
        throw new NotFoundException(`Não é possível registrar a cultura. A fazenda de ID ${farm_id} não existe.`);
      }

      const newCrop = await this.farmCropModel.create(createFarmCropDto as any);
      return newCrop;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Erro crítico ao criar cultura agrícola. Payload: ${JSON.stringify(createFarmCropDto)}`, error.stack);
      throw new InternalServerErrorException('Erro interno ao processar a criação da cultura.');
    }
  }

  async findAll(): Promise<FarmCrop[]> {
    try {
      return await this.farmCropModel.findAll({
        order: [['id', 'ASC']],
      });
    } catch (error) {
      this.logger.error('Erro ao listar culturas agrícolas no banco de dados.', error.stack);
      throw new InternalServerErrorException('Erro interno ao buscar culturas.');
    }
  }

  async findOne(id: number): Promise<FarmCrop> {
    const crop = await this.farmCropModel.findByPk(id);
    if (!crop) {
      this.logger.warn(`Pesquisa falhou: Cultura agrícola ID ${id} não existe.`);
      throw new NotFoundException(`Cultura agrícola de ID ${id} não encontrada.`);
    }
    return crop;
  }

  async update(id: number, updateFarmCropDto: UpdateFarmCropDto): Promise<FarmCrop> {

    try {
      const crop = await this.findOne(id);
      const updatedCrop = await crop.update(updateFarmCropDto);

      return updatedCrop;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Erro ao atualizar a cultura agrícola ID ${id}. Dados enviados: ${JSON.stringify(updateFarmCropDto)}`, error.stack);
      throw new InternalServerErrorException('Erro interno ao atualizar a cultura.');
    }
  }

  async remove(id: number): Promise<{ message: string }> {

    try {
      const crop = await this.findOne(id);
      await crop.destroy();
      return { message: `Cultura agrícola de ID ${id} removida com sucesso.` };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Erro ao remover a cultura agrícola ID ${id}.`, error.stack);
      throw new InternalServerErrorException('Erro interno ao remover a cultura.');
    }
  }
}
