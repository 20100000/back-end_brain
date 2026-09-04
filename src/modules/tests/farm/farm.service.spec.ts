import { Test, TestingModule } from '@nestjs/testing';
import { FarmService } from '../../farm/farm.service';
import { getModelToken } from '@nestjs/sequelize';
import { Farm } from '../../farm/entities/farm.entity';
import { RuralProducer } from '../../rural-producers/entities/rural-producer.entity';
import { FarmCrop } from '../../farm-crops/entities/farm-crop.entity';
import { BadRequestException } from '@nestjs/common';

describe('FarmService', () => {
  let service: FarmService;
  let farmModel: typeof Farm;

  const mockFarm = {
    id: 1,
    farm_name: 'Fazenda Modelo',
    total_farm_area: 100,
    arable_area: 60,
    vegetation_area: 40,
    update: jest.fn().mockReturnThis(),
    destroy: jest.fn().mockResolvedValue(true),
  };

  const mockStateGroup = [
    { state: 'SP', count: '5' },
    { state: 'MT', count: '12' }
  ];

  const mockCropGroup = [
    { crop_name: 'SOJA', count: '8' },
    { crop_name: 'MILHO', count: '4' }
  ];

  const mockLandUseGroup = {
    arable_total: '550.50',
    vegetation_total: '230.25'
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FarmService,
        {
          provide: getModelToken(Farm),
          useValue: {
            create: jest.fn().mockResolvedValue(mockFarm),
            findAll: jest.fn().mockImplementation((options) => {
              if (options?.group?.includes('state')) return mockStateGroup;
              return [mockFarm];
            }),
            findOne: jest.fn().mockImplementation((options) => {
              if (options?.attributes?.[0]?.[0]?.['fn'] === 'SUM') return mockLandUseGroup;
              return mockFarm;
            }),
            findByPk: jest.fn().mockResolvedValue(mockFarm),
            count: jest.fn().mockResolvedValue(10),
            sum: jest.fn().mockResolvedValue(1250.75),
          },
        },
        {
          provide: getModelToken(RuralProducer),
          useValue: {
            findByPk: jest.fn().mockResolvedValue({ id: 1, producer_name: 'Dono' }),
          },
        },
        {
          provide: getModelToken(FarmCrop),
          useValue: {
            findAll: jest.fn().mockResolvedValue(mockCropGroup),
            bulkCreate: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<FarmService>(FarmService);
    farmModel = module.get<typeof Farm>(getModelToken(Farm));
  });

  describe('create (POST) - Validação Matemática', () => {
    it('deve lançar BadRequestException se a soma ultrapassar a área total', async () => {
      const dto = {
        producer_id: 1,
        farm_name: 'Erro',
        city: 'Cidade',
        state: 'SP',
        total_farm_area: 100,
        arable_area: 80,
        vegetation_area: 30,
        harvest: 2026,
      };
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('countAll (GET /farms/amount)', () => {
    it('deve retornar a quantidade total de fazendas cadastradas convertida corretamente', async () => {
      const result = await service.countAll();
      expect(result).toEqual({ total_farms: 10 });
    });
  });

  describe('sumTotalHectares (GET /farms/total-hectares)', () => {
    it('deve retornar a soma de todos os hectares salvos como número', async () => {
      const result = await service.sumTotalHectares();
      expect(result).toEqual({ total_hectares: 1250.75 });
    });

    it('deve retornar 0 se o banco de dados estiver vazio (retorno null do ORM)', async () => {
      jest.spyOn(farmModel, 'sum').mockResolvedValueOnce(null);
      const result = await service.sumTotalHectares();
      expect(result).toEqual({ total_hectares: 0 });
    });
  });

  describe('getGroupByState (GET /farms/chart-by-state)', () => {
    it('deve retornar os dados agrupados por estado convertendo os contadores em Number', async () => {
      const result = await service.getGroupByState();
      expect(result).toEqual([
        { state: 'SP', count: 5 },
        { state: 'MT', count: 12 }
      ]);
    });
  });

  describe('getGroupByCrop (GET /farms/chart-by-crop)', () => {
    it('deve mapear e retornar a quantidade de fazendas agrupadas por tipo de cultura', async () => {
      const result = await service.getGroupByCrop();
      expect(result).toEqual([
        { crop_name: 'SOJA', count: 8 },
        { crop_name: 'MILHO', count: 4 }
      ]);
    });
  });

  describe('getGroupByArable (GET /farms/chart-by-land-use)', () => {
    it('deve consolidar as somas de áreas aráveis e vegetação prontas para o gráfico de pizza', async () => {
      const result = await service.getGroupByArable();
      expect(result).toEqual({
        arable_area_total: 550.50,
        vegetation_area_total: 230.25
      });
    });

    it('deve retornar valores zerados caso não haja registros no banco de dados', async () => {
      jest.spyOn(farmModel, 'findOne').mockResolvedValueOnce(null);
      const result = await service.getGroupByArable();
      expect(result).toEqual({
        arable_area_total: 0,
        vegetation_area_total: 0
      });
    });
  });
});
