import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RuralProducersModule } from './modules/rural-producers/rural-producers.module';
import { FarmModule } from './modules/farm/farm.module';
import { FarmCropsModule } from './modules/farm-crops/farm-crops.module';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || 'tiago@123',
      database: process.env.DB_NAME || 'brain',
      autoLoadModels: true,
      synchronize: false,
      define: { underscored: true },
    }),
    RuralProducersModule,
    FarmModule,
    FarmCropsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
