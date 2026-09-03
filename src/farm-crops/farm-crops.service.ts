import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FarmCrop } from './entities/farm-crop.entity';
import { Farm } from 'src/farm/entities/farm.entity';
import { CreateFarmCropDto } from './dto/create-farm-crop.dto';
import { UpdateFarmCropDto } from './dto/update-farm-crop.dto';

@Injectable()
export class FarmCropsService {
  constructor(
    @InjectModel(FarmCrop)
    private farmCropModel: typeof FarmCrop,

    @InjectModel(Farm)
    private farmModel: typeof Farm,
  ) {}

  async create(createFarmCropDto: CreateFarmCropDto): Promise<FarmCrop> {
    const { farm_id } = createFarmCropDto;

    const farmExists = await this.farmModel.findByPk(farm_id);
    if (!farmExists) {
      throw new NotFoundException(`Não é possível registrar a cultura. A fazenda de ID ${farm_id} não existe.`);
    }

    return await this.farmCropModel.create(createFarmCropDto as any);
  }

  async findAll(): Promise<FarmCrop[]> {
    return await this.farmCropModel.findAll({
      order: [['id', 'ASC']],
    });
  }

  async findOne(id: number): Promise<FarmCrop> {
    const crop = await this.farmCropModel.findByPk(id);
    if (!crop) {
      throw new NotFoundException(`Cultura agrícola de ID ${id} não encontrada.`);
    }
    return crop;
  }

  async update(id: number, updateFarmCropDto: UpdateFarmCropDto): Promise<FarmCrop> {
    const crop = await this.findOne(id); // Já valida se a cultura existe
    return await crop.update(updateFarmCropDto);
  }

  async remove(id: number): Promise<{ message: string }> {
    const crop = await this.findOne(id);
    await crop.destroy();
    return { message: `Cultura agrícola de ID ${id} removida com sucesso.` };
  }
}
