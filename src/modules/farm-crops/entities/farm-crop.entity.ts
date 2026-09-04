import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Farm } from 'src/modules/farm/entities/farm.entity';

@Table({ tableName: 'farm_crops', underscored: true })
export class FarmCrop extends Model<FarmCrop> {
    @Column({
      type: DataType.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    })
    id: number;
  
    @ForeignKey(() => Farm)
    @Column({ type: DataType.INTEGER, allowNull: false })
    farm_id: number;
  
    @BelongsTo(() => Farm)
    farm: Farm;
  
    @Column({ type: DataType.STRING, allowNull: false })
    crop_name: string;
}
