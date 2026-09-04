import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRuralProducerDto {
  @ApiPropertyOptional({ example: '12345678901' })
  document?: string;

  @ApiPropertyOptional({ example: 'Tiago Silva' })
  producer_name?: string;
}
