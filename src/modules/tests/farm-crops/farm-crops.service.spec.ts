import { Test, TestingModule } from '@nestjs/testing';
import { FarmCropsService } from '../../farm-crops/farm-crops.service';
import { getModelToken } from '@nestjs/sequelize';
import { FarmCrop } from '../../farm-crops/entities/farm-crop.entity';
import { Farm } from '../../farm/entities/farm.entity';
import { NotFoundException } from '@nestjs/common';

describe('FarmCropsService', () => {
  let service: FarmCropsService;
  let farmModel: typeof Farm;

  const mockCrop = {
    id: 1,
    farm_id: 1,
    crop_name: 'SOJA',
    destroy: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FarmCropsService,
        {
          provide: getModelToken(FarmCrop),
          useValue: {
            create: jest.fn().mockResolvedValue(mockCrop),
            findByPk: jest.fn().mockResolvedValue(mockCrop),
          },
        },
        {
          provide: getModelToken(Farm),
          useValue: {
            findByPk: jest.fn().mockResolvedValue({ id: 1, farm_name: 'Existe' }),
          },
        },
      ],
    }).compile();

    service = module.get<FarmCropsService>(FarmCropsService);
    farmModel = module.get<typeof Farm>(getModelToken(Farm));
  });

  describe('create (POST)', () => {
    it('deve falhar se a fazenda não existir', async () => {
      jest.spyOn(farmModel, 'findByPk').mockResolvedValueOnce(null);
      const dto = { farm_id: 999, crop_name: 'SOJA' };
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });
  });
});
