import { User } from "../../entities/user.entity";
import { Response, Request } from "express";
import {
  FundWalletDTO,
  LoginDTO,
  transferFund,
  UserDTO,
  verifyPaymentDTO,
} from "./user.dto";
import { UserService } from "./user.service";
import { inject } from "inversify";
import TYPES from "../../constant/types";
import {
  controller,
  httpGet,
  httpPost,
  request,
  requestBody,
  response,
} from "inversify-express-utils";
import { Validator, validate, ValidationError } from "class-validator";
import { plainToInstance } from "class-transformer";
import { responseHandler } from "../../exceptions/responseHandler";

@controller("/api/user")
export class UserController {
  constructor(@inject(TYPES.UserService) private userService: UserService) {}

  /**
   * Handle a simple create of the user on the system
   */
  @httpPost("/create")
  async create(@request() req: Request, @response() res: Response) {
    try {
      const body = plainToInstance(UserDTO, req.body);
      const validation: Array<ValidationError> = await validate(body);
      if (validation.length > 0) {
        const errors = responseHandler.validationError(validation);
        return res.status(errors.statusCode).json(errors);
      }
      const result = await this.userService.createUser(body);

      return res.status(result.statusCode).json(result);
    } catch (e) {
      //console.log(e);
      return res.status(500).json({
        message: "An error occurred",
      });
    }
  }

  /**
   * Handle Login of user using json jwtwebtoken
   *
   */

  @httpPost("/login")
  async login(@request() req: Request, @response() res: Response) {
    try {
      const body = plainToInstance(LoginDTO, req.body);
      const validation: Array<ValidationError> = await validate(body);

      if (validation.length > 0) {
        const errors = responseHandler.validationError(validation);
        return res.status(errors.statusCode).json(errors);
      }
      const result = await this.userService.loginUser(body);
      return res.status(result.statusCode).json(result);
    } catch (e) {
      return res.status(500).json({
        message: "An error occurred",
      });
    }
  }

  @httpPost("/fund-wallet", TYPES.authMiddleware)
  async fundWallet(
    @request() req: Request & { user: User },
    @response() res: Response
  ) {
    try {
      const body = plainToInstance(FundWalletDTO, req.body);
      const validation: Array<ValidationError> = await validate(body);

      if (validation.length > 0) {
        const errors = responseHandler.validationError(validation);
        return res.status(errors.statusCode).json(errors);
      }

      const result = await this.userService.fundwallet(body, req.user);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      return res.status(500).json({
        message: "An error occurred",
      });
    }
  }

  @httpGet("/verify-transaction/:reference", TYPES.authMiddleware)
  async verifyTransaction(
    @request() req: Request & { user: User },
    @response() res: Response
  ) {
    try {
      const body = plainToInstance(verifyPaymentDTO, req.params);
      const validation: Array<ValidationError> = await validate(body);

      if (validation.length > 0) {
        const errors = responseHandler.validationError(validation);
        return res.status(errors.statusCode).json(errors);
      }
      const result = await this.userService.verifyPayment(body, req.user);
      return res.status(result.statusCode).json(result);
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: "An error occurred",
      });
    }
  }

  // transfer
  @httpPost("/transfer-fund", TYPES.authMiddleware)
  async TransferFund(
    @request() req: Request & { user: User },
    @response() res: Response
  ) {
    try {
      const body = plainToInstance(transferFund, req.body);
      const validation: Array<ValidationError> = await validate(body);

      if (validation.length > 0) {
        const errors = responseHandler.validationError(validation);
        return res.status(errors.statusCode).json(errors);
      }
      const result = await this.userService.moveFund(body, req.user);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      return res.status(500).json({
        message: "An error occurred",
      });
    }
  }

   //get loggedIn user details
   @httpGet("/details", TYPES.authMiddleware)
   async CurrentUser(
     @request() req: Request & { user: User },
     @response() res: Response
   ) {
     try {
       const user = req.user;
       return res.status(200).json({
         message: "User current details",
         data: user,
       });
     } catch (error) {
       return res.status(500).json({
         message: "An error occurred",
       });
     }
   }
}
