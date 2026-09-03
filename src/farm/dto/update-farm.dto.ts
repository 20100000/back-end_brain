import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, Min, IsOptional, IsArray } from 'class-validator';

// Classe auxiliar para estruturar o objeto que vem no array
class UpdateFarmCropItemDto {
  @ApiPropertyOptional({ example: 1, description: 'ID da cultura existente (enviar apenas se for atualizar)' })
  @IsNumber()
  @IsOptional()
  id?: number;

  @ApiPropertyOptional({ example: 'Algodão Safrinha', description: 'Nome da cultura' })
  @IsString()
  @IsOptional()
  crop_name?: string;
}

export class UpdateFarmDto {
  @ApiPropertyOptional({ example: 1, description: 'ID do produtor responsável' })
  @IsNumber()
  @IsOptional()
  producer_id?: number;

  @ApiPropertyOptional({ example: 'Fazenda Teste' })
  @IsString()
  @IsOptional()
  farm_name?: string;

  @ApiPropertyOptional({ example: 'Campinas' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'SP' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ example: 120.00 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  total_farm_area?: number;

  @ApiPropertyOptional({ example: 70.00 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  arable_area?: number;

  @ApiPropertyOptional({ example: 50.00 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  vegetation_area?: number;

  @ApiPropertyOptional({ example: 2027 })
  @IsNumber()
  @IsOptional()
  harvest?: number;

  @ApiPropertyOptional({ 
    type: [UpdateFarmCropItemDto],
    description: 'Se enviar "id", atualiza. Se não enviar "id", cria.' 
  })
  @IsArray()
  @IsOptional()
  crops?: UpdateFarmCropItemDto[];
}
