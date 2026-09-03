import { ApiProperty } from '@nestjs/swagger';

export class CreateRuralProducerDto {
  @ApiProperty({ example: '12345678901', description: 'Número do CPF ou CNPJ (apenas números)' })
  document: string;

  @ApiProperty({ example: 'Tiago Silva', description: 'Nome completo do produtor rural' })
  producer_name: string;
}
