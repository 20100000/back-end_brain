import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateFarmCropDto {
  @ApiPropertyOptional({ 
    example: 'Milho Safrinha', 
    description: 'Caso queira alterar o nome da cultura agrícola' 
  })
  @IsString()
  @IsOptional()
  crop_name?: string;
}
