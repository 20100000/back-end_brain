import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FarmCropsService } from './farm-crops.service';
import { CreateFarmCropDto } from './dto/create-farm-crop.dto';
import { UpdateFarmCropDto } from './dto/update-farm-crop.dto';
import { ApiTags } from '@nestjs/swagger'

@ApiTags('Farms Crops')
@Controller('farm-crops')
export class FarmCropsController {
  constructor(private readonly farmCropsService: FarmCropsService) {}

  @Post()
  create(@Body() createFarmCropDto: CreateFarmCropDto) {
    return this.farmCropsService.create(createFarmCropDto);
  }

  @Get()
  findAll() {
    return this.farmCropsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.farmCropsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFarmCropDto: UpdateFarmCropDto) {
    return this.farmCropsService.update(+id, updateFarmCropDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.farmCropsService.remove(+id);
  }
}
