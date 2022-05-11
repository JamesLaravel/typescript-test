import { DatabaseService } from "./../../database/connection";
import {
  STATUS,
  TRANTYPE,
  ACTIVITYTYPE,
} from "./../../entities/transactions.entity";
import { jwt } from "../../constant/jwt";
import { User } from "../../entities/user.entity";
import { responseHandler } from "../../exceptions/responseHandler";
import {
  FundWalletDTO,
  LoginDTO,
  transferFund,
  UserDTO,
  verifyPaymentDTO,
} from "./user.dto";
import { UserRepository, TransactionRepository } from "../../Repository";
import { injectable, inject } from "inversify";
import "dotenv/config";
import bcrypt from "bcryptjs";
import axios, { AxiosError, AxiosResponse } from "axios";
//import { getConnection, Connection } from 'typeorm';

@injectable()
export class UserService {
  constructor() {}

  async createUser(data: UserDTO) {
    try {
      const checkemail = await UserRepository.findOneBy({
        email: data.email,
      });
      if (checkemail) {
        return responseHandler.failed("Email already exist", 400, null);
      }
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(data.password, salt);
      data.password = hash;
      const result = await UserRepository.save(data);
      return responseHandler.success(result, "User created successfully", 200);
    } catch (e) {
      console.log(e);
      return responseHandler.failed((e as Error).message, 400, null);
    }
  }

  async loginUser(data: LoginDTO) {
    try {
      const user = await UserRepository.findOneBy({ email: data.email });
      if (!user)
        return responseHandler.failed("Invalid Email/Password", 400, null);

      const comparePassword = bcrypt.compareSync(data.password, user.password);

      if (!comparePassword)
        return responseHandler.failed("Invalid Email/Password", 400, null);

      const token = jwt.encode(user);
      return responseHandler.success(
        {
          first_name: user.first_name,
          last_name: user.last_name,
          token,
          tokenType: "Bearer",
        },
        "Login successfull",
        200
      );
    } catch (e) {
      return responseHandler.failed((e as Error).message, 400, null);
    }
  }

  async fundwallet(data: FundWalletDTO, user: User) {
    try {
      const reference = jwt.generateRef(10, true).toLowerCase();
      const paystackamount = parseFloat(data.amount!) * 100;
      data.reference = reference;
      data.email = user.email;
      data.amount = paystackamount.toString();
      const url = "https://api.paystack.co/transaction/initialize";
      const result: AxiosResponse = await axios.post(url, data, {
        headers: {
          Authorization: `Bearer ${process.env.SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (!result.data.status) {
        return responseHandler.failed(result.data.messge, 400, null);
      }

      const transaction = TransactionRepository.create({
        userId: user.id,
        reference,
        amount: parseFloat(data.amount),
        tran_type: TRANTYPE.CREDIT,
        activityType: ACTIVITYTYPE.WALLET,
      });

      await TransactionRepository.save(transaction);

      return responseHandler.success(
        result.data,
        "Transaction initialized",
        200
      );
    } catch (e) {
      console.log(e);
      return responseHandler.failed((e as Error).message, 400, null);
    }
  }

  async verifyPayment(data: verifyPaymentDTO, user: User) {
    try {
      // check if the user has a pending transaction yet to be verification base on the reference code
      const transaction = await TransactionRepository.findOneBy({
        userId: user.id,
        status: "pending",
        reference: data.reference?.trim().toLowerCase(),
      });

      if (!transaction)
        return responseHandler.failed(
          "User has not pending transaction",
          400,
          null
        );

      const url = `https://api.paystack.co/transaction/verify/${transaction.reference}`;
      const result: AxiosResponse = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${process.env.SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (result.data.status === false)
        return responseHandler.failed(result.data.message, 400, null);

      const newBalance =
        parseFloat(user.balance.toString()) + result.data.data.amount / 100;

      const updateUser = await UserRepository.update(
        { id: user.id },
        { balance: newBalance }
      );

      if (updateUser) {
        await TransactionRepository.update(
          {
            id: transaction.id,
            userId: user.id,
            reference: data.reference?.trim(),
          },
          {
            status: STATUS.COMPLETED,
          }
        );
      }

      user.balance = newBalance;

      return responseHandler.success(
        {
          first_name: user.first_name,
          last_name: user.last_name,
          balance: user.balance,
        },
        "Transaction verified successfully",
        200
      );
    } catch (e) {
      return responseHandler.failed((e as Error).message, 400, null);
    }
  }

  async moveFund(data: transferFund, user: User) {
    const currentBalance = parseFloat(user.balance.toString());
    const amount = data.amount!;
    if (currentBalance < amount) {
      return responseHandler.failed("Insufficent balance", 400, null);
    }

    const receiver = await UserRepository.findOneBy({
      email: data.email,
    });

    if (!receiver) {
      return responseHandler.failed("User not found", 400, null);
    }

    const reference = jwt.generateRef(20, true);
    const queryRunner = new DatabaseService()
      .getConnection()
      .createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const sendernewBalance = currentBalance - amount;
      const recievernewBalance =
        parseFloat(receiver.balance.toString()) + amount;

      // store sender transaction activities
      // store the debit transaction

      await UserRepository.update(
        { id: user.id },
        {
          balance: sendernewBalance,
        }
      );

      await TransactionRepository.save({
        userId: user.id,
        reference,
        amount: data.amount,
        status: STATUS.COMPLETED,
        tran_type: TRANTYPE.DEBIT,
        activityType: ACTIVITYTYPE.TRANSFER_FUND,
      });

      //---- end for sender-----

      // store receiver transaction activities
      // store the credit transaction
      await UserRepository.update(
        { id: receiver.id },
        {
          balance: recievernewBalance,
        }
      );
      await TransactionRepository.save({
        userId: receiver.id,
        reference,
        amount: data.amount,
        status: STATUS.COMPLETED,
        tran_type: TRANTYPE.CREDIT,
        activityType: ACTIVITYTYPE.RECEIVE_FUND,
      });

      //--- end for reciever -----
      await queryRunner.commitTransaction();
      return responseHandler.success(null, "Transfer done successfully", 200);
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return responseHandler.failed((e as Error).message, 400, null);
    } finally {
      await queryRunner.release();
    }
  }
}
