import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FarmService } from './farm.service';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Farms')
@Controller('farms')
export class FarmController {
  constructor(private readonly farmService: FarmService) {}


  @Get('amount')
  @ApiOperation({ summary: 'Retorna a quantidade total de fazendas cadastradas' })
  async getAmount() {
    return await this.farmService.countAll();
  }

  @Get('total-hectares')
  @ApiOperation({ summary: 'Retorna o total de hectares registrados' })
  async getTotalHectares() {
    return await this.farmService.sumTotalHectares();
  }

  @Get('chart-by-state')
  @ApiOperation({ summary: 'Quantidade de fazendas agrupadas por Estado (UF)' })
  async getChartByState() {
    return await this.farmService.getGroupByState();
  }

  @Get('chart-by-crop')
  @ApiOperation({ summary: 'Quantidade de fazendas agrupadas por Cultura' })
  async getChartByCrop() {
    return await this.farmService.getGroupByCrop();
  }

  @Get('chart-by-land-use')
  @ApiOperation({ summary: 'Soma de uso de solo (Área Arável vs Vegetação)' })
  async getChartByLandUse() {
    return await this.farmService.getGroupByArable();
  }

  @Post()
  async create(@Body() createFarmDto: CreateFarmDto) {
    return await this.farmService.create(createFarmDto);
  }

  @Get()
  async findAll() {
    return await this.farmService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.farmService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateFarmDto: UpdateFarmDto) {
    return await this.farmService.update(+id, updateFarmDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.farmService.remove(+id);
  }
}
