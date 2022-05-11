import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from "class-validator";

import { BeforeInsert } from "typeorm";

export class UserDTO {
  @IsNotEmpty()
  @IsString()
  first_name!: string;

  @IsNotEmpty()
  @IsString()
  last_name!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;

  @BeforeInsert()
  emailToLowerCase() {
    this.email = this.email.toLowerCase();
  }
}

export class LoginDTO {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;
}

export class FundWalletDTO {
  @IsNotEmpty()
  @IsNumberString()
  amount?: string;
  currency?: string;
  email?: string;
  reference?: string;
  callback_url?: string;
}

export class verifyPaymentDTO {
  @IsNotEmpty()
  @IsString()
  reference?: string;
}

export class transferFund {
  @IsNotEmpty()
  @IsEmail()
  email?: string;

  @IsNotEmpty()
  @IsNumberString()
  amount?: number;
}
