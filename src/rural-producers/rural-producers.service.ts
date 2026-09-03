import { Injectable, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { RuralProducer } from './entities/rural-producer.entity';
import { Farm } from 'src/farm/entities/farm.entity';
import { FarmCrop } from 'src/farm-crops/entities/farm-crop.entity';
import { CreateRuralProducerDto } from './dto/create-rural-producer.dto';
import { UpdateRuralProducerDto } from './dto/update-rural-producer.dto';
import { validateCpf } from 'src/utils/validate-cpf';
import { validateCnpj } from 'src/utils/validate-cnpj';

@Injectable()
export class RuralProducersService {
  constructor(
    @InjectModel(RuralProducer)
    private ruralProducerModel: typeof RuralProducer,
  ) {}

  async create(createRuralProducerDto: CreateRuralProducerDto): Promise<RuralProducer> {
    const cleanDocument = createRuralProducerDto.document.replace(/\D/g, '');
    let identifiedType: 'cpf' | 'cnpj';

    if (cleanDocument.length === 11) {
      identifiedType = 'cpf';
      if (!validateCpf(cleanDocument)) throw new BadRequestException('O CPF informado é inválido.');
    } else if (cleanDocument.length === 14) {
      identifiedType = 'cnpj';
      if (!validateCnpj(cleanDocument)) throw new BadRequestException('O CNPJ informado é inválido.');
    } else {
      throw new BadRequestException('O documento deve conter 11 dígitos para CPF ou 14 para CNPJ.');
    }

    try {
      return await this.ruralProducerModel.create({
        ...createRuralProducerDto,
        document: cleanDocument,
        document_type: identifiedType,
      } as any);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException('Já existe um produtor cadastrado com este CPF/CNPJ.');
      }
      throw error;
    }
  }

  async findAll(): Promise<RuralProducer[]> {
    return await this.ruralProducerModel.findAll({
      include: [
        {
          model: Farm,
          include: [FarmCrop],
        },
      ],
      order: [['id', 'ASC']],
    });
  }

  async findOne(id: number): Promise<RuralProducer> {
    const producer = await this.ruralProducerModel.findByPk(id, {
      include: [
        {
          model: Farm,
          include: [FarmCrop],
        },
      ],
    });

    if (!producer) {
      throw new NotFoundException(`Produtor rural com o ID ${id} não foi encontrado.`);
    }

    return producer;
  }

  async update(id: number, updateRuralProducerDto: UpdateRuralProducerDto): Promise<RuralProducer> {
    const producer = await this.findOne(id);

    const updatedData: any = { ...updateRuralProducerDto };

    if (updateRuralProducerDto.document) {
      const cleanDocument = updateRuralProducerDto.document.replace(/\D/g, '');
      let identifiedType: 'cpf' | 'cnpj';

      if (cleanDocument.length === 11) {
        identifiedType = 'cpf';
        if (!validateCpf(cleanDocument)) throw new BadRequestException('O CPF informado é inválido.');
      } else if (cleanDocument.length === 14) {
        identifiedType = 'cnpj';
        if (!validateCnpj(cleanDocument)) throw new BadRequestException('O CNPJ informado é inválido.');
      } else {
        throw new BadRequestException('O documento deve conter 11 dígitos para CPF ou 14 para CNPJ.');
      }

      updatedData.document = cleanDocument;
      updatedData.document_type = identifiedType;
    }

    try {
      return await producer.update(updatedData);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException('Já existe outro produtor cadastrado com este CPF/CNPJ.');
      }
      throw error;
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    const producer = await this.findOne(id);
    await producer.destroy();
    return { message: `Produtor rural de ID ${id} excluído com sucesso.` };
  }
}
