import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Farm } from 'src/modules/farm/entities/farm.entity';

@Table({ tableName: 'rural_producers', underscored: true })
export class RuralProducer extends Model<RuralProducer> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  document: string;

  @Column({
    type: DataType.ENUM('cpf', 'cnpj'),
    allowNull: false,
  })
  document_type: 'cpf' | 'cnpj';

  @Column({ type: DataType.STRING, allowNull: false })
  producer_name: string;

  @HasMany(() => Farm)
  farms: Farm[];
}
