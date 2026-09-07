import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateFarmCropDto {
  @ApiProperty({ 
    example: 1, 
    description: 'ID da fazenda à qual esta cultura pertence' 
  })
  @IsNumber()
  @IsNotEmpty()
  farm_id: number;

  @ApiProperty({ 
    example: 'Algodão', 
    description: 'Nome da cultura agrícola que foi plantada' 
  })
  @IsString()
  @IsNotEmpty()
  crop_name: string;

  @ApiProperty({
    example: 2026,
    description: 'Ano da safra correspondente ao plantio desta cultura'
  })
  @IsNumber()
  @IsNotEmpty()
  harvest: number;
}
