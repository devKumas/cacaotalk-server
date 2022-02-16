import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class DateEntity {
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

export abstract class DeleteDateEntity extends DateEntity {
  @DeleteDateColumn({ name: 'deleted_at' })
  deleteAt!: Date | null;
}

export abstract class AutoDateEntity extends DateEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id!: number;
}

export abstract class AutoDeleteDateEntity extends DeleteDateEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id!: number;
}
