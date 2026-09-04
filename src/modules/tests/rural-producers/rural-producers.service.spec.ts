import { Test, TestingModule } from '@nestjs/testing';
import { RuralProducersService } from '../../rural-producers/rural-producers.service';
import { getModelToken } from '@nestjs/sequelize';
import { RuralProducer } from '../../rural-producers/entities/rural-producer.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('RuralProducersService', () => {
  let service: RuralProducersService;
  let model: typeof RuralProducer;

  const mockProducer = {
    id: 1,
    producer_name: 'Produtor Teste',
    document: '12345678901',
    document_type: 'cpf',
    save: jest.fn().mockResolvedValue(true),
    update: jest.fn().mockImplementation((dto) => Object.assign(mockProducer, dto)),
    destroy: jest.fn().mockResolvedValue(true),
  };

  const mockRuralProducerModel = {
    create: jest.fn().mockResolvedValue(mockProducer),
    findAll: jest.fn().mockResolvedValue([mockProducer]),
    findByPk: jest.fn().mockResolvedValue(mockProducer),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RuralProducersService,
        {
          provide: getModelToken(RuralProducer),
          useValue: mockRuralProducerModel,
        },
      ],
    }).compile();

    service = module.get<RuralProducersService>(RuralProducersService);
    model = module.get<typeof RuralProducer>(getModelToken(RuralProducer));
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create (POST)', () => {
    it('deve rejeitar se o documento for inválido', async () => {
      const dto = { producer_name: 'Invalido', document: '123' };
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll (GET)', () => {
    it('deve retornar uma lista de produtores', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockProducer]);
    });
  });

  describe('findOne (GET :id)', () => {
    it('deve retornar um único produtor se ele existir', async () => {
      const result = await service.findOne(1);
      expect(result).toEqual(mockProducer);
    });
  });

  describe('update (PATCH)', () => {
    it('deve atualizar com sucesso o nome', async () => {
      const dto = { producer_name: 'Nome Alterado' };
      const result = await service.update(1, dto);
      expect(result.producer_name).toEqual('Nome Alterado');
    });
  });

  describe('remove (DELETE)', () => {
    it('deve remover um produtor com sucesso', async () => {
      const result = await service.remove(1);
      expect(result).toEqual({ message: 'Produtor rural de ID 1 excluído com sucesso.' });
    });
  });
});
