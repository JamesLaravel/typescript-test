import { Transaction } from "../entities/transactions.entity";
import { DatabaseService } from "../database/connection";
import { User } from "../entities/user.entity";

export const UserRepository = new DatabaseService()
  .getConnection()
  .getRepository(User);

export const TransactionRepository = new DatabaseService()
  .getConnection()
  .getRepository(Transaction);
