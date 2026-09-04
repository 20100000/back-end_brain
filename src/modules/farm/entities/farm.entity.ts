import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { RuralProducer } from 'src/modules/rural-producers/entities/rural-producer.entity';
import { FarmCrop } from 'src/modules/farm-crops/entities/farm-crop.entity';

@Table({ tableName: 'farms', underscored: true })
export class Farm extends Model<Farm> {
    @Column({
      type: DataType.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    })
    id: number;
  
    @ForeignKey(() => RuralProducer)
    @Column({ type: DataType.INTEGER, allowNull: false })
    producer_id: number;
  
    @BelongsTo(() => RuralProducer)
    producer: RuralProducer;
  
    @Column({ type: DataType.STRING, allowNull: false })
    farm_name: string;
  
    @Column({ type: DataType.STRING, allowNull: false })
    city: string;
  
    @Column({ type: DataType.STRING(2), allowNull: false })
    state: string;
  
    @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
    total_farm_area: number;
  
    @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
    arable_area: number;
  
    @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
    vegetation_area: number;
  
    @Column({ type: DataType.INTEGER, allowNull: false })
    harvest: number;
  
    @HasMany(() => FarmCrop)
    crops: FarmCrop[];
}
