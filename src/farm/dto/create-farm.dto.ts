import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min, IsArray, IsOptional } from 'class-validator';


export class CreateFarmDto {
  @ApiProperty({ example: 1, description: 'ID do produtor dono desta fazenda' })
  @IsNumber()
  @IsNotEmpty()
  producer_id: number;

  @ApiProperty({ example: 'Fazenda Boa Vista', description: 'Nome da propriedade rural' })
  @IsString()
  @IsNotEmpty()
  farm_name: string;

  @ApiProperty({ example: 'Hortolândia', description: 'Cidade onde a fazenda está localizada' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'SP', description: 'Sigla do Estado (UF) com 2 caracteres' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: 100.50, description: 'Área total da fazenda em hectares' })
  @IsNumber()
  @Min(0)
  total_farm_area: number;

  @ApiProperty({ example: 60.00, description: 'Área agricultável em hectares' })
  @IsNumber()
  @Min(0)
  arable_area: number;

  @ApiProperty({ example: 40.50, description: 'Área de vegetação nativa em hectares' })
  @IsNumber()
  @Min(0)
  vegetation_area: number;

  @ApiProperty({ example: 2026, description: 'Ano da safra correspondente' })
  @IsNumber()
  @IsNotEmpty()
  harvest: number;

  @ApiPropertyOptional({ 
    example: ['Soja', 'Milho'], 
    description: 'Lista de culturas plantadas nesta fazenda',
    type: [String] 
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  initial_crops?: string[];
}
