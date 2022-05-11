import { User } from "./user.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export enum STATUS {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
}

export enum TRANTYPE {
  CREDIT = "credit",
  DEBIT = "debit",
}

export enum ACTIVITYTYPE {
  WALLET = "fund-wallet",
  TRANSFER_FUND = "transfer-fund",
  RECEIVE_FUND = "receive-fund",
}

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, (user) => user.transactions, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  user?: User;

  @Column({ nullable: false, type: "varchar" })
  userId?: string;

  @Column({ nullable: false, type: "varchar" })
  reference!: string;

  @Column({ nullable: false, type: "numeric" })
  amount!: number;

  @Column({
    nullable: false,
    type: "enum",
    enum: STATUS,
    default: STATUS.PENDING,
  })
  status!: string;

  @Column({ nullable: true, type: "enum", enum: TRANTYPE })
  tran_type!: string;

  @Column({ nullable: true, type: "enum", enum: ACTIVITYTYPE })
  activityType!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn() updatedAt!: Date;
}
