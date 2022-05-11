import { Transaction } from "./transactions.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  EntityRepository,
  PrimaryGeneratedColumn,
  Repository,
  UpdateDateColumn,
  BeforeInsert,
  OneToMany,
} from "typeorm";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @IsNotEmpty()
  @IsString()
  @Column({ nullable: false, type: "varchar" })
  first_name!: string;

  @IsNotEmpty()
  @IsString()
  @Column({ nullable: false, type: "varchar" })
  last_name!: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @Column({ nullable: false, type: "varchar", unique: true })
  email!: string;

  @IsNotEmpty()
  @IsString()
  @Column({ nullable: false, type: "varchar" })
  password!: string;

  @Column({ type: "numeric", precision: 15, scale: 2, default: 0.0 })
  balance!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn() updatedAt!: Date;

  @OneToMany(() => Transaction, (transactions) => transactions.user)
  transactions?: Transaction[];
}
