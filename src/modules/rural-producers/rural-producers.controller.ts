import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RuralProducersService } from './rural-producers.service';
import { CreateRuralProducerDto } from './dto/create-rural-producer.dto';
import { UpdateRuralProducerDto } from './dto/update-rural-producer.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Rural Producers')
@Controller('rural-producers')
export class RuralProducersController {
  constructor(private readonly ruralProducersService: RuralProducersService) {}

  @Post()
  async create(@Body() createRuralProducerDto: CreateRuralProducerDto) {
    const response = await this.ruralProducersService.create(createRuralProducerDto);
    return response;
  }

  @Get()
  async findAll() {
    return await this.ruralProducersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.ruralProducersService.findOne(+id); // O '+' converte string para número
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateRuralProducerDto: UpdateRuralProducerDto) {
    return await this.ruralProducersService.update(+id, updateRuralProducerDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.ruralProducersService.remove(+id);
  }
}
