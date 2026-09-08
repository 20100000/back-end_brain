import { Injectable, ConflictException, BadRequestException, NotFoundException, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { RuralProducer } from './entities/rural-producer.entity';
import { Farm } from 'src/modules/farm/entities/farm.entity';
import { FarmCrop } from 'src/modules/farm-crops/entities/farm-crop.entity';
import { CreateRuralProducerDto } from './dto/create-rural-producer.dto';
import { UpdateRuralProducerDto } from './dto/update-rural-producer.dto';
import { validateCpf } from 'src/utils/validate-cpf';
import { validateCnpj } from 'src/utils/validate-cnpj';

@Injectable()
export class RuralProducersService {
  private readonly logger = new Logger(RuralProducersService.name);

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

      this.logger.error(`Erro crítico ao registrar produtor rural. Payload: ${JSON.stringify(createRuralProducerDto)}`, error.stack);
      throw new InternalServerErrorException('Erro interno ao processar a criação do produtor.');
    }
  }

  async findAll(): Promise<RuralProducer[]> {
    try {
      return await this.ruralProducerModel.findAll({
        include: [
          {
            model: Farm,
            include: [FarmCrop],
          },
        ],
        order: [['id', 'ASC']],
      });
    } catch (error) {
      this.logger.error('Erro ao listar todos os produtores rurais.', error.stack);
      throw new InternalServerErrorException('Erro interno ao buscar dados de produtores.');
    }
  }

  async findOne(id: number): Promise<RuralProducer> {
    try {
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
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(`Erro ao buscar o produtor rural de ID ${id}.`, error.stack);
      throw new InternalServerErrorException('Erro interno ao buscar dados do produtor.');
    }
  }

  async update(id: number, updateRuralProducerDto: UpdateRuralProducerDto): Promise<RuralProducer> {
    try {
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

      return await producer.update(updatedData);
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new ConflictException('Já existe outro produtor cadastrado com este CPF/CNPJ.');
      }
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;

      this.logger.error(`Erro crítico ao atualizar o produtor ID ${id}. Dados enviados: ${JSON.stringify(updateRuralProducerDto)}`, error.stack);
      throw new InternalServerErrorException('Erro interno ao atualizar os dados do produtor.');
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      const producer = await this.findOne(id);
      await producer.destroy();
      return { message: `Produtor rural de ID ${id} excluído com sucesso.` };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(`Erro ao remover o produtor rural de ID ${id}.`, error.stack);
      throw new InternalServerErrorException('Erro interno ao remover o registro do produtor.');
    }
  }
}
